<?php

namespace App\Jobs;

use App\Models\ApifyRequest;
use App\Models\Review;
use App\Services\Apify\ApifyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * ProcessApifyResultsJob
 *
 * Fetches and processes results from a completed Apify actor run.
 */
class ProcessApifyResultsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ApifyRequest $apifyRequest
    ) {
        $this->onQueue('sync-reviews');
    }

    /**
     * Execute the job.
     */
    public function handle(ApifyService $apifyService): void
    {
        // Refresh from DB
        $this->apifyRequest->refresh();

        // Skip if already completed or failed
        if ($this->apifyRequest->is_finished) {
            Log::info('Apify results processing skipped - already finished', [
                'apify_request_id' => $this->apifyRequest->id,
                'status' => $this->apifyRequest->status,
            ]);
            return;
        }

        $connection = $this->apifyRequest->reviewConnection;

        if (!$connection) {
            Log::error('Apify results processing failed - connection not found', [
                'apify_request_id' => $this->apifyRequest->id,
            ]);
            $this->apifyRequest->markFailed('Connection not found');
            return;
        }

        Log::info('Processing Apify results', [
            'apify_request_id' => $this->apifyRequest->id,
            'run_id' => $this->apifyRequest->run_id,
            'platform' => $this->apifyRequest->platform,
        ]);

        try {
            // Fetch results from Apify
            $results = $apifyService->getRunResults($this->apifyRequest->run_id);

            if (empty($results)) {
                Log::warning('Apify returned no results', [
                    'apify_request_id' => $this->apifyRequest->id,
                    'run_id' => $this->apifyRequest->run_id,
                ]);

                $this->apifyRequest->markCompleted(0);
                $connection->markSyncSuccess();
                return;
            }

            $reviewsProcessed = 0;

            foreach ($results as $item) {
                try {
                    // Handle different result structures
                    // Some actors return reviews directly, others nest them
                    $reviews = $this->extractReviews($item);

                    foreach ($reviews as $reviewData) {
                        // Transform to our format
                        $transformed = $apifyService->transformReview(
                            $reviewData,
                            $this->apifyRequest->platform
                        );

                        // Add our fields
                        $transformed['location_id'] = $connection->location_id;
                        $transformed['review_connection_id'] = $connection->id;
                        $transformed['sync_source'] = 'apify';

                        // Upsert review
                        Review::updateOrCreate(
                            [
                                'location_id' => $connection->location_id,
                                'platform' => $this->apifyRequest->platform,
                                'external_id' => $transformed['external_id'],
                            ],
                            $transformed
                        );

                        $reviewsProcessed++;
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to process individual Apify result item', [
                        'apify_request_id' => $this->apifyRequest->id,
                        'error' => $e->getMessage(),
                    ]);
                    // Continue processing other items
                }
            }

            // Mark as completed
            $this->apifyRequest->markCompleted($reviewsProcessed);
            $connection->markSyncSuccess();

            Log::info('Apify results processed successfully', [
                'apify_request_id' => $this->apifyRequest->id,
                'reviews_processed' => $reviewsProcessed,
            ]);

        } catch (\Exception $e) {
            $this->apifyRequest->markFailed($e->getMessage());
            $connection->markSyncFailed($e->getMessage());

            Log::error('Apify results processing failed', [
                'apify_request_id' => $this->apifyRequest->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract reviews from an Apify result item.
     *
     * Different actors have different output structures.
     */
    private function extractReviews(array $item): array
    {
        // If the item has a 'reviews' key, use that
        if (isset($item['reviews']) && is_array($item['reviews'])) {
            return $item['reviews'];
        }

        // If the item looks like a single review (has rating or text), return as array
        if (isset($item['rating']) || isset($item['text']) || isset($item['id'])) {
            return [$item];
        }

        // Check for other common keys
        $reviewKeys = ['review', 'data', 'items'];
        foreach ($reviewKeys as $key) {
            if (isset($item[$key])) {
                return is_array($item[$key]) ? $item[$key] : [$item[$key]];
            }
        }

        // Default: treat the whole item as a review
        return [$item];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $this->apifyRequest->markFailed(
            'Processing failed after maximum retries: ' . $exception->getMessage()
        );

        $connection = $this->apifyRequest->reviewConnection;
        if ($connection) {
            $connection->markSyncFailed('Result processing failed');
        }

        Log::error('Apify results processing job failed permanently', [
            'apify_request_id' => $this->apifyRequest->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
