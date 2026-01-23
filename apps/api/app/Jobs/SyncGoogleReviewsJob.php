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
        public ReviewConnection $reviewConnection
    ) {
        $this->onQueue('sync-reviews');
    }

    /**
     * Execute the job.
     */
    public function handle(GoogleBusinessReviewService $reviewService): void
    {
        // Refresh connection from DB
        $this->reviewConnection->refresh();

        // Check if connection is still valid
        if (!$this->reviewConnection->is_active || !$this->reviewConnection->has_valid_token) {
            Log::warning('Google sync skipped - connection not valid', [
                'connection_id' => $this->reviewConnection->id,
                'is_active' => $this->reviewConnection->is_active,
                'has_valid_token' => $this->reviewConnection->has_valid_token,
            ]);
            return;
        }

        // Check sync lock
        if ($this->reviewConnection->isSyncLocked()) {
            Log::info('Google sync skipped - already locked', [
                'connection_id' => $this->reviewConnection->id,
            ]);
            return;
        }

        // Acquire sync lock
        $this->reviewConnection->markSyncStarted('api');

        Log::info('Starting Google reviews sync', [
            'connection_id' => $this->reviewConnection->id,
            'location_id' => $this->reviewConnection->location_id,
        ]);

        try {
            $totalSynced = 0;
            $pageToken = null;

            do {
                // Fetch reviews from Google
                $result = $reviewService->getReviews(
                    $this->reviewConnection,
                    pageSize: 50,
                    pageToken: $pageToken
                );

                foreach ($result['reviews'] as $googleReview) {
                    // Transform and upsert review
                    $reviewData = $reviewService->transformReview($googleReview);
                    $reviewData['location_id'] = $this->reviewConnection->location_id;
                    $reviewData['review_connection_id'] = $this->reviewConnection->id;
                    $reviewData['sync_source'] = 'api';

                    Review::updateOrCreate(
                        [
                            'location_id' => $this->reviewConnection->location_id,
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
            $this->reviewConnection->markSyncSuccess();

            Log::info('Google reviews sync completed', [
                'connection_id' => $this->reviewConnection->id,
                'reviews_synced' => $totalSynced,
            ]);

        } catch (\Exception $e) {
            // Mark sync as failed
            $this->reviewConnection->markSyncFailed($e->getMessage());

            Log::error('Google reviews sync failed', [
                'connection_id' => $this->reviewConnection->id,
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
        $this->reviewConnection->markSyncFailed(
            'Sync failed after maximum retries: ' . $exception->getMessage()
        );

        Log::error('Google reviews sync job failed permanently', [
            'connection_id' => $this->reviewConnection->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
