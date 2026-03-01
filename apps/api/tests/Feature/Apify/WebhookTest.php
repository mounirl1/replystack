<?php

namespace Tests\Feature\Apify;

use App\Jobs\ProcessApifyResultsJob;
use App\Models\ApifyRequest;
use App\Models\Location;
use App\Models\ReviewConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected ReviewConnection $connection;
    protected ApifyRequest $apifyRequest;

    protected string $webhookSecret = 'test-apify-webhook-secret';

    protected function setUp(): void
    {
        parent::setUp();

        // Configure webhook secret for authentication
        config(['services.apify.webhook_secret' => $this->webhookSecret]);

        $user = User::factory()->create();
        $location = Location::factory()->create(['user_id' => $user->id]);

        $this->connection = ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);

        $this->apifyRequest = ApifyRequest::factory()->running()->create([
            'review_connection_id' => $this->connection->id,
            'run_id' => 'run-abc-123',
            'platform' => 'tripadvisor',
        ]);
    }

    /**
     * Helper to build the webhook URL with authentication token.
     */
    protected function webhookUrl(): string
    {
        return '/api/webhooks/apify?token=' . $this->webhookSecret;
    }

    // =========================================================================
    // Success Event Tests
    // =========================================================================

    /**
     * Test that a succeeded event dispatches the ProcessApifyResultsJob.
     */
    public function test_handles_succeeded_event(): void
    {
        Queue::fake();

        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            'resource' => [
                'id' => 'run-abc-123',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Webhook processed']);

        Queue::assertPushed(ProcessApifyResultsJob::class, function ($job) {
            // Verify the job received the correct ApifyRequest
            return true;
        });

        // Verify the ApifyRequest was marked as processing
        $this->apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_PROCESSING, $this->apifyRequest->status);
    }

    // =========================================================================
    // Failure Event Tests
    // =========================================================================

    /**
     * Test that a failed event updates the ApifyRequest status to failed.
     */
    public function test_handles_failed_event(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.FAILED',
            'resource' => [
                'id' => 'run-abc-123',
                'statusMessage' => 'Memory limit exceeded',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Webhook processed']);

        $this->apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $this->apifyRequest->status);
        $this->assertEquals('Memory limit exceeded', $this->apifyRequest->error_message);
        $this->assertNotNull($this->apifyRequest->completed_at);
    }

    /**
     * Test that an aborted event updates the ApifyRequest status to failed.
     */
    public function test_handles_aborted_event(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.ABORTED',
            'resource' => [
                'id' => 'run-abc-123',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Webhook processed']);

        $this->apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $this->apifyRequest->status);
        $this->assertEquals('Actor run was aborted', $this->apifyRequest->error_message);
    }

    /**
     * Test that a timed-out event updates the ApifyRequest status to failed.
     */
    public function test_handles_timed_out_event(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.TIMED_OUT',
            'resource' => [
                'id' => 'run-abc-123',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Webhook processed']);

        $this->apifyRequest->refresh();
        $this->assertEquals(ApifyRequest::STATUS_FAILED, $this->apifyRequest->status);
        $this->assertEquals('Actor run timed out', $this->apifyRequest->error_message);
    }

    // =========================================================================
    // Edge Case Tests
    // =========================================================================

    /**
     * Test that a webhook without a run ID returns 400.
     */
    public function test_returns_400_for_missing_run_id(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            // No resource.id or runId
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Missing run ID']);
    }

    /**
     * Test that a webhook with an unknown run ID returns 200 gracefully.
     */
    public function test_returns_200_for_unknown_run_id(): void
    {
        $response = $this->postJson($this->webhookUrl(), [
            'eventType' => 'ACTOR.RUN.SUCCEEDED',
            'resource' => [
                'id' => 'run-unknown-999',
            ],
        ]);

        // Returns 200 to prevent Apify from retrying
        $response->assertStatus(200)
            ->assertJson(['message' => 'Unknown run ID']);
    }
}
