<?php

namespace App\Jobs;

use App\Models\Review;
use App\Models\ReviewConnection;
use App\Services\Google\GoogleBusinessReviewService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SyncGoogleReviewsJob
 *
 * Syncs reviews from Google Business Profile for a specific connection.
 */
class SyncGoogleReviewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ReviewConnection $connection
    ) {
        $this->onQueue('sync-reviews');
    }

    /**
     * Execute the job.
     */
    public function handle(GoogleBusinessReviewService $reviewService): void
    {
        // Refresh connection from DB
        $this->connection->refresh();

        // Check if connection is still valid
        if (!$this->connection->is_active || !$this->connection->has_valid_token) {
            Log::warning('Google sync skipped - connection not valid', [
                'connection_id' => $this->connection->id,
                'is_active' => $this->connection->is_active,
                'has_valid_token' => $this->connection->has_valid_token,
            ]);
            return;
        }

        // Check sync lock
        if ($this->connection->isSyncLocked()) {
            Log::info('Google sync skipped - already locked', [
                'connection_id' => $this->connection->id,
            ]);
            return;
        }

        // Acquire sync lock
        $this->connection->markSyncStarted('api');

        Log::info('Starting Google reviews sync', [
            'connection_id' => $this->connection->id,
            'location_id' => $this->connection->location_id,
        ]);

        try {
            $totalSynced = 0;
            $pageToken = null;

            do {
                // Fetch reviews from Google
                $result = $reviewService->getReviews(
                    $this->connection,
                    pageSize: 50,
                    pageToken: $pageToken
                );

                foreach ($result['reviews'] as $googleReview) {
                    // Transform and upsert review
                    $reviewData = $reviewService->transformReview($googleReview);
                    $reviewData['location_id'] = $this->connection->location_id;
                    $reviewData['review_connection_id'] = $this->connection->id;
                    $reviewData['sync_source'] = 'api';

                    Review::updateOrCreate(
                        [
                            'location_id' => $this->connection->location_id,
                            'platform' => 'google',
                            'external_id' => $reviewData['external_id'],
                        ],
                        $reviewData
                    );

                    $totalSynced++;
                }

                $pageToken = $result['nextPageToken'];

                // Avoid rate limiting
                if ($pageToken) {
                    sleep(1);
                }

            } while ($pageToken);

            // Mark sync as successful
            $this->connection->markSyncSuccess();

            Log::info('Google reviews sync completed', [
                'connection_id' => $this->connection->id,
                'reviews_synced' => $totalSynced,
            ]);

        } catch (\Exception $e) {
            // Mark sync as failed
            $this->connection->markSyncFailed($e->getMessage());

            Log::error('Google reviews sync failed', [
                'connection_id' => $this->connection->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
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
            'Sync failed after maximum retries: ' . $exception->getMessage()
        );

        Log::error('Google reviews sync job failed permanently', [
            'connection_id' => $this->connection->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
