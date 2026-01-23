<?php

namespace App\Services\Sentiment;

use App\Models\Location;
use App\Models\Review;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Service for detecting negative sentiment trends in reviews.
 *
 * Analyzes review patterns to identify:
 * - Spikes in negative reviews
 * - Declining sentiment scores over time
 * - Theme-specific issues (e.g., service complaints increasing)
 */
class NegativeTrendService
{
    /**
     * Trend analysis result.
     */
    public const TREND_STABLE = 'stable';
    public const TREND_IMPROVING = 'improving';
    public const TREND_DECLINING = 'declining';
    public const TREND_CRITICAL = 'critical';

    /**
     * Analyze negative trends for a location.
     *
     * @param Location $location The location to analyze
     * @param int|null $windowDays Override the location's configured window
     * @return NegativeTrendResult
     */
    public function analyze(Location $location, ?int $windowDays = null): NegativeTrendResult
    {
        $windowDays = $windowDays ?? $location->alert_negative_window_days;
        $threshold = $location->alert_negative_threshold;
        $sentimentThreshold = $location->alert_sentiment_threshold;

        // Get reviews in the analysis window
        $recentReviews = $location->reviews()
            ->where('published_at', '>=', now()->subDays($windowDays))
            ->orderBy('published_at', 'desc')
            ->get();

        // Get previous period for comparison
        $previousReviews = $location->reviews()
            ->whereBetween('published_at', [
                now()->subDays($windowDays * 2),
                now()->subDays($windowDays),
            ])
            ->get();

        // Calculate metrics
        $currentStats = $this->calculatePeriodStats($recentReviews);
        $previousStats = $this->calculatePeriodStats($previousReviews);

        // Detect trend
        $trend = $this->detectTrend($currentStats, $previousStats, $threshold, $sentimentThreshold);

        // Identify problem themes
        $problemThemes = $this->identifyProblemThemes($recentReviews, $previousReviews);

        // Get critical reviews (1-star or very negative sentiment)
        $criticalReviews = $recentReviews->filter(function ($review) use ($sentimentThreshold) {
            return $review->rating === 1 ||
                ($review->sentiment_score !== null && $review->sentiment_score < $sentimentThreshold);
        });

        return new NegativeTrendResult(
            trend: $trend,
            currentStats: $currentStats,
            previousStats: $previousStats,
            problemThemes: $problemThemes,
            criticalReviewsCount: $criticalReviews->count(),
            negativeReviewsCount: $recentReviews->filter(fn($r) => $r->rating <= 2)->count(),
            windowDays: $windowDays,
            alertTriggered: $this->shouldTriggerAlert($trend, $currentStats, $threshold)
        );
    }

    /**
     * Calculate statistics for a period of reviews.
     *
     * @param Collection $reviews
     * @return array
     */
    private function calculatePeriodStats(Collection $reviews): array
    {
        if ($reviews->isEmpty()) {
            return [
                'total_reviews' => 0,
                'average_rating' => null,
                'average_sentiment' => null,
                'negative_count' => 0,
                'positive_count' => 0,
                'neutral_count' => 0,
                'negative_percentage' => 0,
                'rating_distribution' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
                'theme_counts' => [],
            ];
        }

        $totalReviews = $reviews->count();
        $averageRating = $reviews->whereNotNull('rating')->avg('rating');
        $averageSentiment = $reviews->whereNotNull('sentiment_score')->avg('sentiment_score');

        $negativeCount = $reviews->filter(fn($r) => $r->rating !== null && $r->rating <= 2)->count();
        $positiveCount = $reviews->filter(fn($r) => $r->rating !== null && $r->rating >= 4)->count();
        $neutralCount = $reviews->filter(fn($r) => $r->rating === 3)->count();

        // Rating distribution
        $ratingDistribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach ($reviews as $review) {
            if ($review->rating !== null && isset($ratingDistribution[$review->rating])) {
                $ratingDistribution[$review->rating]++;
            }
        }

        // Theme counts
        $themeCounts = [];
        foreach ($reviews as $review) {
            if (is_array($review->sentiment_themes)) {
                foreach ($review->sentiment_themes as $theme) {
                    $themeCounts[$theme] = ($themeCounts[$theme] ?? 0) + 1;
                }
            }
        }
        arsort($themeCounts);

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => $averageRating ? round($averageRating, 2) : null,
            'average_sentiment' => $averageSentiment ? round($averageSentiment, 2) : null,
            'negative_count' => $negativeCount,
            'positive_count' => $positiveCount,
            'neutral_count' => $neutralCount,
            'negative_percentage' => $totalReviews > 0 ? round(($negativeCount / $totalReviews) * 100, 1) : 0,
            'rating_distribution' => $ratingDistribution,
            'theme_counts' => $themeCounts,
        ];
    }

    /**
     * Detect the trend based on comparison of periods.
     *
     * @param array $current Current period stats
     * @param array $previous Previous period stats
     * @param int $threshold Negative review threshold for alerts
     * @param float $sentimentThreshold Sentiment score threshold
     * @return string
     */
    private function detectTrend(array $current, array $previous, int $threshold, float $sentimentThreshold): string
    {
        // Not enough data
        if ($current['total_reviews'] < 3) {
            return self::TREND_STABLE;
        }

        // Critical: High negative percentage or very low average
        if ($current['negative_percentage'] >= 40 ||
            ($current['average_sentiment'] !== null && $current['average_sentiment'] < $sentimentThreshold)) {
            return self::TREND_CRITICAL;
        }

        // No previous data to compare
        if ($previous['total_reviews'] < 2) {
            // Check absolute numbers
            if ($current['negative_count'] >= $threshold) {
                return self::TREND_DECLINING;
            }
            return self::TREND_STABLE;
        }

        // Calculate changes
        $negativeChange = $current['negative_percentage'] - $previous['negative_percentage'];
        $ratingChange = ($current['average_rating'] ?? 0) - ($previous['average_rating'] ?? 0);
        $sentimentChange = ($current['average_sentiment'] ?? 0.5) - ($previous['average_sentiment'] ?? 0.5);

        // Declining: Significant increase in negative reviews or drop in ratings
        if ($negativeChange >= 15 || $ratingChange <= -0.5 || $sentimentChange <= -0.15) {
            return self::TREND_DECLINING;
        }

        // Improving: Significant decrease in negative reviews or increase in ratings
        if ($negativeChange <= -10 || $ratingChange >= 0.3 || $sentimentChange >= 0.1) {
            return self::TREND_IMPROVING;
        }

        return self::TREND_STABLE;
    }

    /**
     * Identify themes that are causing problems (appearing more frequently in negative reviews).
     *
     * @param Collection $currentReviews
     * @param Collection $previousReviews
     * @return array
     */
    private function identifyProblemThemes(Collection $currentReviews, Collection $previousReviews): array
    {
        // Count themes in negative reviews only
        $currentNegativeThemes = $this->countThemesInNegativeReviews($currentReviews);
        $previousNegativeThemes = $this->countThemesInNegativeReviews($previousReviews);

        $problemThemes = [];

        foreach ($currentNegativeThemes as $theme => $count) {
            $previousCount = $previousNegativeThemes[$theme] ?? 0;
            $increase = $count - $previousCount;

            // Theme is a problem if it appears 2+ times and increased or is new
            if ($count >= 2 && ($increase > 0 || $previousCount === 0)) {
                $problemThemes[$theme] = [
                    'count' => $count,
                    'previous_count' => $previousCount,
                    'increase' => $increase,
                    'is_new' => $previousCount === 0,
                ];
            }
        }

        // Sort by count descending
        uasort($problemThemes, fn($a, $b) => $b['count'] <=> $a['count']);

        return $problemThemes;
    }

    /**
     * Count theme occurrences in negative reviews.
     *
     * @param Collection $reviews
     * @return array
     */
    private function countThemesInNegativeReviews(Collection $reviews): array
    {
        $themeCounts = [];

        foreach ($reviews as $review) {
            // Only count themes from negative reviews
            if ($review->rating !== null && $review->rating <= 2 && is_array($review->sentiment_themes)) {
                foreach ($review->sentiment_themes as $theme) {
                    $themeCounts[$theme] = ($themeCounts[$theme] ?? 0) + 1;
                }
            }
        }

        return $themeCounts;
    }

    /**
     * Determine if an alert should be triggered.
     *
     * @param string $trend The detected trend
     * @param array $stats Current period stats
     * @param int $threshold Configured threshold
     * @return bool
     */
    private function shouldTriggerAlert(string $trend, array $stats, int $threshold): bool
    {
        // Always alert on critical
        if ($trend === self::TREND_CRITICAL) {
            return true;
        }

        // Alert on declining if threshold exceeded
        if ($trend === self::TREND_DECLINING && $stats['negative_count'] >= $threshold) {
            return true;
        }

        return false;
    }

    /**
     * Get all locations with negative trends that need alerts.
     *
     * @return Collection
     */
    public function getLocationsNeedingAlerts(): Collection
    {
        return Location::withNegativeTrendAlerts()
            ->get()
            ->filter(function (Location $location) {
                if (!$location->canSendTrendAlert()) {
                    return false;
                }

                $result = $this->analyze($location);
                return $result->alertTriggered;
            });
    }

    /**
     * Check for immediate review alerts (1-star reviews).
     *
     * @param Review $review The review to check
     * @return bool Whether an immediate alert should be sent
     */
    public function shouldSendImmediateAlert(Review $review): bool
    {
        $location = $review->location;

        if (!$location->hasAlertsEnabled()) {
            return false;
        }

        if (!$location->canSendReviewAlert()) {
            return false;
        }

        // Check 1-star alert
        if ($location->alert_on_1_star && $review->rating === 1) {
            return true;
        }

        // Check 2-star alert
        if ($location->alert_on_2_star && $review->rating === 2) {
            return true;
        }

        return false;
    }
}
