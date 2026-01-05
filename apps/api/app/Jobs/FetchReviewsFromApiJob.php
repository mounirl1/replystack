<?php

namespace App\Jobs;

use App\Exceptions\PlatformApiException;
use App\Models\Location;
use App\Services\Platforms\PlatformApiFactory;
use App\Services\ReviewSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to fetch reviews from platform APIs (Google, Facebook).
 */
class FetchReviewsFromApiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array<int>
     */
    public $backoff = [60, 300, 900];

    /**
     * The queue this job should be dispatched to.
     *
     * @var string
     */
    public $queue = 'reviews';

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Location $location,
        public string $platform
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ReviewSyncService $syncService): void
    {
        Log::info('FetchReviewsFromApiJob: Starting fetch', [
            'location_id' => $this->location->id,
            'location_name' => $this->location->name,
            'platform' => $this->platform,
        ]);

        // Get platform service
        $service = PlatformApiFactory::make($this->platform, $this->location);

        if ($service === null) {
            Log::warning('FetchReviewsFromApiJob: Platform not supported', [
                'location_id' => $this->location->id,
                'platform' => $this->platform,
            ]);
            $this->fail(new \Exception("Platform {$this->platform} does not support API integration"));
            return;
        }

        if (!$service->isConnected()) {
            Log::warning('FetchReviewsFromApiJob: Platform not connected', [
                'location_id' => $this->location->id,
                'platform' => $this->platform,
            ]);
            $this->fail(new \Exception("Platform {$this->platform} is not connected for this location"));
            return;
        }

        try {
            // Fetch reviews from platform
            $reviews = $service->fetchReviews();

            // Sync to database
            $stats = $syncService->syncBatch(
                $this->location,
                $this->platform,
                $reviews,
                'api'
            );

            // Update last fetch timestamp
            $this->location->update([
                'last_api_fetch_at' => now(),
            ]);

            Log::info('FetchReviewsFromApiJob: Completed successfully', [
                'location_id' => $this->location->id,
                'platform' => $this->platform,
                'reviews_fetched' => count($reviews),
                'stats' => $stats,
            ]);

        } catch (PlatformApiException $e) {
            Log::error('FetchReviewsFromApiJob: API error', [
                'location_id' => $this->location->id,
                'platform' => $this->platform,
                'error_code' => $e->errorCode,
                'error_message' => $e->errorMessage,
            ]);

            // If auth error, clear tokens so user is prompted to reconnect
            if ($e->isAuthError()) {
                $this->clearPlatformTokens();
                Log::warning('FetchReviewsFromApiJob: Cleared tokens due to auth error', [
                    'location_id' => $this->location->id,
                    'platform' => $this->platform,
                ]);
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('FetchReviewsFromApiJob: Failed permanently', [
            'location_id' => $this->location->id,
            'platform' => $this->platform,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // If it's an auth error that persisted, clear tokens
        if ($exception instanceof PlatformApiException && $exception->isAuthError()) {
            $this->clearPlatformTokens();
        }
    }

    /**
     * Clear platform tokens on the location.
     */
    protected function clearPlatformTokens(): void
    {
        $updateData = match ($this->platform) {
            'google' => [
                'google_access_token' => null,
                'google_refresh_token' => null,
                'google_token_expires_at' => null,
            ],
            'facebook' => [
                'facebook_access_token' => null,
                'facebook_token_expires_at' => null,
            ],
            default => [],
        };

        if (!empty($updateData)) {
            $this->location->update($updateData);
        }
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<string>
     */
    public function tags(): array
    {
        return [
            'fetch-reviews',
            'location:' . $this->location->id,
            'platform:' . $this->platform,
        ];
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHours(2);
    }
}
