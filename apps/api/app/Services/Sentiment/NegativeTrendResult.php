<?php

namespace App\Services\Sentiment;

/**
 * Data transfer object for negative trend analysis results.
 */
readonly class NegativeTrendResult
{
    public function __construct(
        public string $trend,
        public array $currentStats,
        public array $previousStats,
        public array $problemThemes,
        public int $criticalReviewsCount,
        public int $negativeReviewsCount,
        public int $windowDays,
        public bool $alertTriggered
    ) {}

    /**
     * Check if the trend is critical.
     */
    public function isCritical(): bool
    {
        return $this->trend === NegativeTrendService::TREND_CRITICAL;
    }

    /**
     * Check if the trend is declining.
     */
    public function isDeclining(): bool
    {
        return $this->trend === NegativeTrendService::TREND_DECLINING;
    }

    /**
     * Check if the trend is improving.
     */
    public function isImproving(): bool
    {
        return $this->trend === NegativeTrendService::TREND_IMPROVING;
    }

    /**
     * Check if the trend is stable.
     */
    public function isStable(): bool
    {
        return $this->trend === NegativeTrendService::TREND_STABLE;
    }

    /**
     * Get the rating change between periods.
     */
    public function getRatingChange(): ?float
    {
        if ($this->currentStats['average_rating'] === null || $this->previousStats['average_rating'] === null) {
            return null;
        }

        return round($this->currentStats['average_rating'] - $this->previousStats['average_rating'], 2);
    }

    /**
     * Get the sentiment change between periods.
     */
    public function getSentimentChange(): ?float
    {
        if ($this->currentStats['average_sentiment'] === null || $this->previousStats['average_sentiment'] === null) {
            return null;
        }

        return round($this->currentStats['average_sentiment'] - $this->previousStats['average_sentiment'], 2);
    }

    /**
     * Get the top problem themes (limited).
     *
     * @param int $limit Maximum themes to return
     * @return array
     */
    public function getTopProblemThemes(int $limit = 3): array
    {
        return array_slice($this->problemThemes, 0, $limit, true);
    }

    /**
     * Get a human-readable trend description.
     */
    public function getTrendDescription(): string
    {
        return match ($this->trend) {
            NegativeTrendService::TREND_CRITICAL => 'Situation critique - intervention requise',
            NegativeTrendService::TREND_DECLINING => 'Tendance à la baisse détectée',
            NegativeTrendService::TREND_IMPROVING => 'Tendance positive',
            NegativeTrendService::TREND_STABLE => 'Tendance stable',
            default => 'Indéterminé',
        };
    }

    /**
     * Get the severity level for alerting.
     */
    public function getSeverity(): string
    {
        return match ($this->trend) {
            NegativeTrendService::TREND_CRITICAL => 'critical',
            NegativeTrendService::TREND_DECLINING => 'warning',
            default => 'info',
        };
    }

    /**
     * Convert to array for API responses.
     */
    public function toArray(): array
    {
        return [
            'trend' => $this->trend,
            'trend_description' => $this->getTrendDescription(),
            'severity' => $this->getSeverity(),
            'alert_triggered' => $this->alertTriggered,
            'window_days' => $this->windowDays,
            'current_period' => [
                'total_reviews' => $this->currentStats['total_reviews'],
                'average_rating' => $this->currentStats['average_rating'],
                'average_sentiment' => $this->currentStats['average_sentiment'],
                'negative_count' => $this->currentStats['negative_count'],
                'negative_percentage' => $this->currentStats['negative_percentage'],
                'rating_distribution' => $this->currentStats['rating_distribution'],
            ],
            'previous_period' => [
                'total_reviews' => $this->previousStats['total_reviews'],
                'average_rating' => $this->previousStats['average_rating'],
                'average_sentiment' => $this->previousStats['average_sentiment'],
                'negative_count' => $this->previousStats['negative_count'],
                'negative_percentage' => $this->previousStats['negative_percentage'],
            ],
            'changes' => [
                'rating' => $this->getRatingChange(),
                'sentiment' => $this->getSentimentChange(),
            ],
            'problem_themes' => $this->getTopProblemThemes(),
            'critical_reviews_count' => $this->criticalReviewsCount,
            'negative_reviews_count' => $this->negativeReviewsCount,
        ];
    }
}
