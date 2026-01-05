<?php

namespace App\Jobs;

use App\Exceptions\PlatformApiException;
use App\Models\Response;
use App\Models\Review;
use App\Services\Platforms\PlatformApiFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to publish a reply to a review via platform API.
 */
class PublishReplyJob implements ShouldQueue
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
    public $backoff = [30, 120, 300];

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
        public Review $review,
        public Response $response
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('PublishReplyJob: Starting publish', [
            'review_id' => $this->review->id,
            'response_id' => $this->response->id,
            'platform' => $this->review->platform,
        ]);

        $location = $this->review->location;

        // Get platform service
        $service = PlatformApiFactory::make($this->review->platform, $location);

        if ($service === null) {
            $this->fail(new \Exception("Platform {$this->review->platform} does not support API integration"));
            return;
        }

        if (!$service->supportsPublish()) {
            $this->fail(new \Exception("Platform {$this->review->platform} does not support publishing replies via API"));
            return;
        }

        if (!$service->isConnected()) {
            $this->fail(new \Exception("Platform {$this->review->platform} is not connected for this location"));
            return;
        }

        try {
            // Publish the reply
            $success = $service->publishReply($this->review, $this->response->content);

            if ($success) {
                // Update response as published
                $this->response->update([
                    'is_published' => true,
                    'published_at' => now(),
                ]);

                // Update review status
                $this->review->update([
                    'status' => 'replied',
                    'replied_at' => now(),
                ]);

                Log::info('PublishReplyJob: Published successfully', [
                    'review_id' => $this->review->id,
                    'response_id' => $this->response->id,
                    'platform' => $this->review->platform,
                ]);
            } else {
                throw new \Exception('Platform API returned unsuccessful response');
            }

        } catch (PlatformApiException $e) {
            Log::error('PublishReplyJob: API error', [
                'review_id' => $this->review->id,
                'response_id' => $this->response->id,
                'platform' => $this->review->platform,
                'error_code' => $e->errorCode,
                'error_message' => $e->errorMessage,
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('PublishReplyJob: Failed permanently', [
            'review_id' => $this->review->id,
            'response_id' => $this->response->id,
            'platform' => $this->review->platform,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // Mark response with error (optional: add publish_error column)
        // $this->response->update(['publish_error' => $exception->getMessage()]);
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<string>
     */
    public function tags(): array
    {
        return [
            'publish-reply',
            'review:' . $this->review->id,
            'response:' . $this->response->id,
            'platform:' . $this->review->platform,
        ];
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHour();
    }
}
