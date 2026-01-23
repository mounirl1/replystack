<?php

namespace App\Console\Commands;

use App\Jobs\AnalyzeReviewSentimentJob;
use App\Models\Review;
use Illuminate\Console\Command;

/**
 * Artisan command to analyze sentiment for existing reviews.
 *
 * Dispatches AnalyzeReviewSentimentJob for each review that matches
 * the specified criteria.
 */
class AnalyzeReviewsSentimentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reviews:analyze-sentiment
                            {--location= : Analyze only reviews for this location ID}
                            {--limit=100 : Maximum number of reviews to analyze}
                            {--force : Re-analyze reviews that have already been analyzed}
                            {--sync : Run analysis synchronously (for debugging)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze sentiment for existing reviews using AI';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $query = Review::query()
            ->when(
                ! $this->option('force'),
                fn ($q) => $q->whereNull('sentiment_analyzed_at')
            )
            ->when(
                $this->option('location'),
                fn ($q) => $q->where('location_id', $this->option('location'))
            )
            ->orderByDesc('published_at')
            ->limit((int) $this->option('limit'));

        $count = $query->count();

        if ($count === 0) {
            $this->info('No reviews found matching the criteria.');

            return Command::SUCCESS;
        }

        $this->info("Found {$count} reviews to analyze.");

        if ($this->option('sync')) {
            $this->warn('Running in synchronous mode (for debugging only).');
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $dispatched = 0;
        $skipped = 0;

        $query->chunk(50, function ($reviews) use ($bar, &$dispatched, &$skipped) {
            foreach ($reviews as $review) {
                // Skip reviews without content (will use rating fallback)
                if (empty($review->content) && $review->rating === null) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                if ($this->option('sync')) {
                    // Run synchronously for debugging
                    AnalyzeReviewSentimentJob::dispatchSync($review);
                } else {
                    // Dispatch to queue
                    AnalyzeReviewSentimentJob::dispatch($review);
                }

                $dispatched++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->info("Dispatched {$dispatched} jobs for sentiment analysis.");

        if ($skipped > 0) {
            $this->warn("Skipped {$skipped} reviews without content or rating.");
        }

        if (! $this->option('sync')) {
            $this->info('Check Laravel Horizon for job progress.');
        }

        return Command::SUCCESS;
    }
}
