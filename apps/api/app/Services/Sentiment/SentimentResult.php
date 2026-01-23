<?php

namespace App\Services\Sentiment;

/**
 * Data Transfer Object for sentiment analysis results.
 */
readonly class SentimentResult
{
    /**
     * Valid sentiment themes that can be detected.
     *
     * @var array<string>
     */
    public const VALID_THEMES = [
        'service',
        'cleanliness',
        'price',
        'quality',
        'welcome',
        'location',
        'ambiance',
        'value_for_money',
    ];

    /**
     * Create a new sentiment result.
     *
     * @param float $score The sentiment score (0.0 = very negative, 1.0 = very positive)
     * @param string $label The sentiment label (positive, neutral, negative)
     * @param array<string> $themes The detected themes from the review
     */
    public function __construct(
        public float $score,
        public string $label,
        public array $themes,
    ) {}

    /**
     * Convert the result to an array.
     *
     * @return array{score: float, label: string, themes: array<string>}
     */
    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'label' => $this->label,
            'themes' => $this->themes,
        ];
    }

    /**
     * Check if the sentiment is positive.
     */
    public function isPositive(): bool
    {
        return $this->label === 'positive';
    }

    /**
     * Check if the sentiment is negative.
     */
    public function isNegative(): bool
    {
        return $this->label === 'negative';
    }

    /**
     * Check if the sentiment is neutral.
     */
    public function isNeutral(): bool
    {
        return $this->label === 'neutral';
    }

    /**
     * Check if a specific theme was detected.
     */
    public function hasTheme(string $theme): bool
    {
        return in_array($theme, $this->themes, true);
    }
}
