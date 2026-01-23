<?php

namespace App\Jobs;

use App\Models\Review;
use App\Services\Sentiment\SentimentAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to analyze the sentiment of a review asynchronously.
 *
 * Uses the SentimentAnalysisService to extract sentiment score,
 * label, and themes from the review content via Gemini AI.
 */
class AnalyzeReviewSentimentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array<int>
     */
    public array $backoff = [30, 60, 120];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Review $review
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited('gemini-sentiment')];
    }

    /**
     * Execute the job.
     */
    public function handle(SentimentAnalysisService $service): void
    {
        try {
            $result = $service->analyze($this->review);

            $this->review->update([
                'sentiment_score' => $result->score,
                'sentiment_label' => $result->label,
                'sentiment_themes' => $result->themes,
                'sentiment_analyzed_at' => now(),
            ]);

            Log::info('Sentiment analysis completed', [
                'review_id' => $this->review->id,
                'score' => $result->score,
                'label' => $result->label,
                'themes' => $result->themes,
            ]);
        } catch (\Exception $e) {
            Log::warning('Sentiment analysis failed', [
                'review_id' => $this->review->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Only throw if we haven't exhausted retries
            // This allows the job to be retried with backoff
            if ($this->attempts() < $this->tries) {
                throw $e;
            }

            // On final attempt, use rating-based fallback
            $fallbackResult = $service->analyzeFromRating($this->review->rating);
            $this->review->update([
                'sentiment_score' => $fallbackResult->score,
                'sentiment_label' => $fallbackResult->label,
                'sentiment_themes' => [],
                'sentiment_analyzed_at' => now(),
            ]);

            Log::info('Sentiment analysis used rating fallback', [
                'review_id' => $this->review->id,
                'score' => $fallbackResult->score,
                'label' => $fallbackResult->label,
            ]);
        }
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return [
            'sentiment-analysis',
            'review:' . $this->review->id,
            'location:' . $this->review->location_id,
        ];
    }
}
