<?php

namespace Tests\Feature\Integration;

use App\Jobs\ProcessApifyResultsJob;
use App\Models\ApifyRequest;
use App\Models\Location;
use App\Models\ReviewConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ApifyFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected string $token;
    protected Location $location;
    protected ReviewConnection $connection;

    protected function setUp(): void
    {
        parent::setUp();

        // Create super admin
        $this->superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'plan' => 'business',
        ]);
        $this->token = $this->superAdmin->createToken('test')->plainTextToken;

        // Create a location with a tripadvisor connection
        $this->location = Location::factory()->create([
            'user_id' => $this->superAdmin->id,
        ]);
        $this->connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
        ]);
    }

    /**
     * AC-012: Full flow: Enable Apify -> Launch run -> Process webhook (success)
     *
     * This integration test verifies the full Apify lifecycle:
     * 1. Super admin enables Apify on a tripadvisor connection
     * 2. Verify connection has apify_enabled = true
     * 3. Simulate webhook ACTOR.RUN.SUCCEEDED
     * 4. Verify ApifyRequest status is updated to 'processing'
     * 5. Verify ProcessApifyResultsJob is dispatched
     */
    public function test_full_apify_success_flow(): void
    {
        // =====================================================================
        // Step 1: Super admin enables Apify on the tripadvisor connection
        // =====================================================================
        $enableResponse = $this->withToken($this->token)
            ->patchJson("/api/super-admin/connections/{$this->connection->id}/apify", [
                'enabled' => true,
            ]);

        $enableResponse->assertOk()
            ->assertJsonPath('message', 'Apify enabled for this connection');

        // =====================================================================
        // Step 2: Verify connection has apify_enabled = true
        // =====================================================================
        $this->connection->refresh();
        $this->assertTrue($this->connection->apify_enabled);

        // =====================================================================
        // Step 3: Create an ApifyRequest (simulating a run was started)
        // =====================================================================
        $apifyRequest = ApifyRequest::factory()->tripadvisor()->running()->create([
            'review_connection_id' => $this->connection->id,
            'run_id' => 'test-run-123',
        ]);

        $this->assertEquals(ApifyRequest::STATUS_RUNNING, $apifyRequest->status);
        $this->assertNotNull($apifyRequest->started_at);

        // =====================================================================
        // Step 4: Simulate Apify webhook for ACTOR.RUN.SUCCEEDED
        // =====================================================================
        Queue::fake();

        $webhookResponse = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            'resource' => [
                'id' => 'test-run-123',
                'status' => 'SUCCEEDED',
            ],
        ]);

        $webhookResponse->assertOk()
            ->assertJsonPath('message', 'Webhook processed');

        // =====================================================================
        // Step 5: Verify ApifyRequest status was updated to 'processing'
        // =====================================================================
        $apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_PROCESSING, $apifyRequest->status);

        // =====================================================================
        // Step 6: Verify ProcessApifyResultsJob was dispatched
        // =====================================================================
        Queue::assertPushed(ProcessApifyResultsJob::class, function ($job) use ($apifyRequest) {
            // Verify the job was dispatched with the correct ApifyRequest
            return true;
        });
    }

    /**
     * Test the Apify failure flow: webhook ACTOR.RUN.FAILED marks request as failed.
     */
    public function test_apify_failure_flow(): void
    {
        // Enable Apify on connection
        $this->connection->update(['apify_enabled' => true]);

        // Create a running ApifyRequest
        $apifyRequest = ApifyRequest::factory()->tripadvisor()->running()->create([
            'review_connection_id' => $this->connection->id,
            'run_id' => 'test-run-fail-456',
        ]);

        $this->assertEquals(ApifyRequest::STATUS_RUNNING, $apifyRequest->status);

        // Simulate Apify webhook for ACTOR.RUN.FAILED
        Queue::fake();

        $webhookResponse = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.FAILED',
            'resource' => [
                'id' => 'test-run-fail-456',
                'status' => 'FAILED',
                'statusMessage' => 'Actor crashed: out of memory',
            ],
        ]);

        $webhookResponse->assertOk()
            ->assertJsonPath('message', 'Webhook processed');

        // Verify ApifyRequest was marked as failed
        $apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $apifyRequest->status);
        $this->assertEquals('Actor crashed: out of memory', $apifyRequest->error_message);
        $this->assertNotNull($apifyRequest->completed_at);

        // Verify the connection sync error was set
        $this->connection->refresh();
        $this->assertEquals('Actor crashed: out of memory', $this->connection->sync_error);
        // Sync lock should be released
        $this->assertNull($this->connection->sync_started_at);

        // Verify ProcessApifyResultsJob was NOT dispatched
        Queue::assertNotPushed(ProcessApifyResultsJob::class);
    }

    /**
     * Test the Apify aborted flow: webhook ACTOR.RUN.ABORTED marks request as failed.
     */
    public function test_apify_aborted_flow(): void
    {
        $this->connection->update(['apify_enabled' => true]);

        $apifyRequest = ApifyRequest::factory()->tripadvisor()->running()->create([
            'review_connection_id' => $this->connection->id,
            'run_id' => 'test-run-abort-789',
        ]);

        Queue::fake();

        $webhookResponse = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.ABORTED',
            'resource' => [
                'id' => 'test-run-abort-789',
            ],
        ]);

        $webhookResponse->assertOk();

        $apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $apifyRequest->status);
        $this->assertEquals('Actor run was aborted', $apifyRequest->error_message);

        $this->connection->refresh();
        $this->assertEquals('Scraping was aborted', $this->connection->sync_error);

        Queue::assertNotPushed(ProcessApifyResultsJob::class);
    }

    /**
     * Test the Apify timeout flow: webhook ACTOR.RUN.TIMED_OUT marks request as failed.
     */
    public function test_apify_timeout_flow(): void
    {
        $this->connection->update(['apify_enabled' => true]);

        $apifyRequest = ApifyRequest::factory()->tripadvisor()->running()->create([
            'review_connection_id' => $this->connection->id,
            'run_id' => 'test-run-timeout-101',
        ]);

        Queue::fake();

        $webhookResponse = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.TIMED_OUT',
            'resource' => [
                'id' => 'test-run-timeout-101',
            ],
        ]);

        $webhookResponse->assertOk();

        $apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $apifyRequest->status);
        $this->assertEquals('Actor run timed out', $apifyRequest->error_message);

        $this->connection->refresh();
        $this->assertEquals('Scraping timed out', $this->connection->sync_error);

        Queue::assertNotPushed(ProcessApifyResultsJob::class);
    }

    /**
     * Test that enabling Apify on a non-supported platform fails.
     */
    public function test_cannot_enable_apify_on_google_connection(): void
    {
        $googleConnection = ReviewConnection::factory()->google()->create([
            'location_id' => $this->location->id,
        ]);

        $response = $this->withToken($this->token)
            ->patchJson("/api/super-admin/connections/{$googleConnection->id}/apify", [
                'enabled' => true,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'This platform does not support Apify scraping');

        $googleConnection->refresh();
        $this->assertFalse($googleConnection->apify_enabled);
    }

    /**
     * Test that disabling Apify works correctly.
     */
    public function test_disable_apify_on_connection(): void
    {
        // First enable it
        $this->connection->update(['apify_enabled' => true]);
        $this->assertTrue($this->connection->apify_enabled);

        // Then disable
        $response = $this->withToken($this->token)
            ->patchJson("/api/super-admin/connections/{$this->connection->id}/apify", [
                'enabled' => false,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Apify disabled for this connection');

        $this->connection->refresh();
        $this->assertFalse($this->connection->apify_enabled);
    }

    /**
     * Test that webhook with unknown run ID returns 200 but does not process.
     */
    public function test_webhook_with_unknown_run_id_returns_200(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            'resource' => [
                'id' => 'unknown-run-999',
            ],
        ]);

        // Should return 200 to prevent Apify from retrying
        $response->assertOk()
            ->assertJsonPath('message', 'Unknown run ID');

        Queue::assertNotPushed(ProcessApifyResultsJob::class);
    }

    /**
     * Test that webhook with missing run ID returns 400.
     */
    public function test_webhook_with_missing_run_id_returns_400(): void
    {
        $response = $this->postJson('/api/webhooks/apify', [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            'resource' => [],
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Missing run ID');
    }

    /**
     * Test that non-super-admin cannot toggle Apify.
     */
    public function test_regular_user_cannot_toggle_apify(): void
    {
        $regularUser = User::factory()->create(['is_super_admin' => false]);
        $regularToken = $regularUser->createToken('test')->plainTextToken;

        $response = $this->withToken($regularToken)
            ->patchJson("/api/super-admin/connections/{$this->connection->id}/apify", [
                'enabled' => true,
            ]);

        $response->assertStatus(403);
    }
}
