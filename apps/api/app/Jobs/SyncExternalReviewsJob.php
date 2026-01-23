<?php

namespace App\Jobs;

use App\Models\ReviewConnection;
use App\Services\Apify\ApifyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SyncExternalReviewsJob
 *
 * Syncs reviews from external platforms (TripAdvisor, Booking, Airbnb) using Apify.
 * This job triggers the Apify actor and the actual processing happens via webhook.
 */
class SyncExternalReviewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ReviewConnection $connection,
        public int $reviewLimit = 100
    ) {
        $this->onQueue('sync-reviews');
    }

    /**
     * Execute the job.
     */
    public function handle(ApifyService $apifyService): void
    {
        // Refresh connection from DB
        $this->connection->refresh();

        // Validate connection
        if (!$this->connection->is_active) {
            Log::warning('External sync skipped - connection not active', [
                'connection_id' => $this->connection->id,
            ]);
            return;
        }

        if (!$this->connection->canUseApify()) {
            Log::warning('External sync skipped - Apify not enabled', [
                'connection_id' => $this->connection->id,
                'platform' => $this->connection->platform,
            ]);
            return;
        }

        if (empty($this->connection->platform_url)) {
            Log::warning('External sync skipped - no platform URL', [
                'connection_id' => $this->connection->id,
            ]);
            return;
        }

        // Check sync lock
        if ($this->connection->isSyncLocked()) {
            Log::info('External sync skipped - already locked', [
                'connection_id' => $this->connection->id,
            ]);
            return;
        }

        // Check if Apify is configured
        if (!$apifyService->isConfigured()) {
            Log::warning('External sync skipped - Apify not configured', [
                'connection_id' => $this->connection->id,
            ]);
            return;
        }

        // Acquire sync lock
        $this->connection->markSyncStarted('apify');

        Log::info('Starting external reviews sync via Apify', [
            'connection_id' => $this->connection->id,
            'platform' => $this->connection->platform,
            'location_id' => $this->connection->location_id,
        ]);

        try {
            // Trigger Apify actor based on platform
            $apifyRequest = match ($this->connection->platform) {
                'tripadvisor' => $apifyService->requestTripAdvisorReviews($this->connection, $this->reviewLimit),
                'booking' => $apifyService->requestBookingReviews($this->connection, $this->reviewLimit),
                'airbnb' => $apifyService->requestAirbnbReviews($this->connection, $this->reviewLimit),
                default => throw new \Exception("Unsupported platform: {$this->connection->platform}"),
            };

            Log::info('Apify actor started', [
                'connection_id' => $this->connection->id,
                'apify_request_id' => $apifyRequest->id,
                'run_id' => $apifyRequest->run_id,
            ]);

            // Note: The actual review processing happens in ProcessApifyResultsJob
            // which is triggered by the Apify webhook when the actor completes.

        } catch (\Exception $e) {
            // Mark sync as failed
            $this->connection->markSyncFailed($e->getMessage());

            Log::error('External reviews sync failed', [
                'connection_id' => $this->connection->id,
                'platform' => $this->connection->platform,
                'error' => $e->getMessage(),
            ]);

            // Re-throw to let the queue handle retries
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $this->connection->markSyncFailed(
            'Sync job failed: ' . $exception->getMessage()
        );

        Log::error('External reviews sync job failed', [
            'connection_id' => $this->connection->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
