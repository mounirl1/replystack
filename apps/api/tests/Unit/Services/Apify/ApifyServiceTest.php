<?php

namespace Tests\Unit\Services\Apify;

use App\Models\ApifyRequest;
use App\Models\ReviewConnection;
use App\Services\Apify\ApifyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ApifyServiceTest extends TestCase
{
    use RefreshDatabase;

    private ApifyService $service;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.apify.api_token' => 'test-apify-token',
            'services.apify.webhook_url' => 'https://api.reply-stack.app/api/apify/webhook',
        ]);

        $this->service = new ApifyService();
    }

    // ========================================
    // requestTripAdvisorReviews() Tests
    // ========================================

    public function test_requests_tripadvisor_reviews(): void
    {
        $connection = ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create();

        $actorId = ApifyRequest::getActorIdForPlatform('tripadvisor');

        Http::fake([
            "api.apify.com/v2/acts/{$actorId}/runs" => Http::response([
                'data' => [
                    'id' => 'run-tripadvisor-123',
                    'status' => 'RUNNING',
                    'startedAt' => '2026-02-12T10:00:00.000Z',
                ],
            ], 201),
        ]);

        $apifyRequest = $this->service->requestTripAdvisorReviews($connection, 50);

        $this->assertInstanceOf(ApifyRequest::class, $apifyRequest);
        $this->assertEquals('run-tripadvisor-123', $apifyRequest->run_id);
        $this->assertEquals($actorId, $apifyRequest->actor_id);
        $this->assertEquals($connection->id, $apifyRequest->review_connection_id);
        $this->assertEquals(ApifyRequest::STATUS_RUNNING, $apifyRequest->status);
        $this->assertEquals('tripadvisor', $apifyRequest->platform);
        $this->assertEquals(50, $apifyRequest->reviews_requested);
        $this->assertNotNull($apifyRequest->started_at);

        $this->assertDatabaseHas('apify_requests', [
            'run_id' => 'run-tripadvisor-123',
            'platform' => 'tripadvisor',
            'review_connection_id' => $connection->id,
        ]);

        Http::assertSent(function ($request) use ($actorId) {
            return str_contains($request->url(), "acts/{$actorId}/runs")
                && $request->hasHeader('Authorization', 'Bearer test-apify-token')
                && $request->method() === 'POST';
        });
    }

    // ========================================
    // requestBookingReviews() Tests
    // ========================================

    public function test_requests_booking_reviews(): void
    {
        $connection = ReviewConnection::factory()->booking()->apifyEnabled()->create();

        $actorId = ApifyRequest::getActorIdForPlatform('booking');

        Http::fake([
            "api.apify.com/v2/acts/{$actorId}/runs" => Http::response([
                'data' => [
                    'id' => 'run-booking-456',
                    'status' => 'RUNNING',
                    'startedAt' => '2026-02-12T11:00:00.000Z',
                ],
            ], 201),
        ]);

        $apifyRequest = $this->service->requestBookingReviews($connection, 100);

        $this->assertInstanceOf(ApifyRequest::class, $apifyRequest);
        $this->assertEquals('run-booking-456', $apifyRequest->run_id);
        $this->assertEquals($actorId, $apifyRequest->actor_id);
        $this->assertEquals($connection->id, $apifyRequest->review_connection_id);
        $this->assertEquals('booking', $apifyRequest->platform);
        $this->assertEquals(100, $apifyRequest->reviews_requested);

        $this->assertDatabaseHas('apify_requests', [
            'run_id' => 'run-booking-456',
            'platform' => 'booking',
        ]);

        Http::assertSent(function ($request) use ($actorId) {
            return str_contains($request->url(), "acts/{$actorId}/runs")
                && $request->method() === 'POST';
        });
    }

    // ========================================
    // getRunStatus() Tests
    // ========================================

    public function test_gets_run_status(): void
    {
        Http::fake([
            'api.apify.com/v2/actor-runs/run-status-789' => Http::response([
                'data' => [
                    'id' => 'run-status-789',
                    'status' => 'SUCCEEDED',
                    'startedAt' => '2026-02-12T10:00:00.000Z',
                    'finishedAt' => '2026-02-12T10:05:00.000Z',
                    'stats' => [
                        'durationMillis' => 300000,
                    ],
                ],
            ], 200),
        ]);

        $result = $this->service->getRunStatus('run-status-789');

        $this->assertIsArray($result);
        $this->assertEquals('run-status-789', $result['id']);
        $this->assertEquals('SUCCEEDED', $result['status']);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'actor-runs/run-status-789')
                && $request->hasHeader('Authorization', 'Bearer test-apify-token')
                && $request->method() === 'GET';
        });
    }

    public function test_get_run_status_throws_on_failure(): void
    {
        Http::fake([
            'api.apify.com/v2/actor-runs/bad-run' => Http::response('Not Found', 404),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Failed to get Apify run status');

        $this->service->getRunStatus('bad-run');
    }

    // ========================================
    // getRunResults() Tests
    // ========================================

    public function test_gets_run_results(): void
    {
        Http::fake([
            'api.apify.com/v2/actor-runs/run-results-101/dataset/items' => Http::response([
                [
                    'id' => 'review-1',
                    'text' => 'Great hotel!',
                    'rating' => 5,
                    'user' => ['username' => 'traveler1'],
                    'publishedDate' => '2026-01-10',
                ],
                [
                    'id' => 'review-2',
                    'text' => 'Terrible service.',
                    'rating' => 1,
                    'user' => ['username' => 'traveler2'],
                    'publishedDate' => '2026-01-11',
                ],
            ], 200),
        ]);

        $result = $this->service->getRunResults('run-results-101');

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals('review-1', $result[0]['id']);
        $this->assertEquals('review-2', $result[1]['id']);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'actor-runs/run-results-101/dataset/items')
                && $request->hasHeader('Authorization', 'Bearer test-apify-token')
                && $request->method() === 'GET';
        });
    }

    public function test_get_run_results_throws_on_failure(): void
    {
        Http::fake([
            'api.apify.com/v2/actor-runs/bad-run/dataset/items' => Http::response('Server Error', 500),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Failed to get Apify run results');

        $this->service->getRunResults('bad-run');
    }

    // ========================================
    // isConfigured() Tests
    // ========================================

    public function test_is_configured_returns_true_with_token(): void
    {
        $this->assertTrue($this->service->isConfigured());
    }

    public function test_is_configured_returns_false_without_token(): void
    {
        config(['services.apify.api_token' => '']);

        $service = new ApifyService();

        $this->assertFalse($service->isConfigured());
    }

    public function test_requests_airbnb_reviews(): void
    {
        $connection = ReviewConnection::factory()->airbnb()->apifyEnabled()->create();

        $actorId = ApifyRequest::getActorIdForPlatform('airbnb');

        Http::fake([
            "api.apify.com/v2/acts/{$actorId}/runs" => Http::response([
                'data' => [
                    'id' => 'run-airbnb-789',
                    'status' => 'RUNNING',
                    'startedAt' => '2026-02-12T12:00:00.000Z',
                ],
            ], 201),
        ]);

        $apifyRequest = $this->service->requestAirbnbReviews($connection, 75);

        $this->assertInstanceOf(ApifyRequest::class, $apifyRequest);
        $this->assertEquals('run-airbnb-789', $apifyRequest->run_id);
        $this->assertEquals($actorId, $apifyRequest->actor_id);
        $this->assertEquals('airbnb', $apifyRequest->platform);
        $this->assertEquals(75, $apifyRequest->reviews_requested);

        $this->assertDatabaseHas('apify_requests', [
            'run_id' => 'run-airbnb-789',
            'platform' => 'airbnb',
        ]);
    }
}
