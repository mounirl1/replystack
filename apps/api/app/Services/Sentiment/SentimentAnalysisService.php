<?php

namespace App\Services\Sentiment;

use App\Models\Review;
use App\Services\AI\GeminiService;
use Illuminate\Support\Facades\Log;

/**
 * Service for analyzing sentiment in customer reviews.
 *
 * Uses Gemini AI to analyze review content and extract:
 * - Sentiment score (0.0-1.0)
 * - Sentiment label (positive, neutral, negative)
 * - Detected themes (service, price, quality, etc.)
 */
class SentimentAnalysisService
{
    public function __construct(
        private GeminiService $gemini
    ) {}

    /**
     * Analyze the sentiment of a review.
     *
     * @param Review $review The review to analyze
     * @return SentimentResult The analysis result
     * @throws \RuntimeException If AI analysis fails after retries
     */
    public function analyze(Review $review): SentimentResult
    {
        // If no content, use rating-based analysis
        if (empty($review->content)) {
            return $this->analyzeFromRating($review->rating);
        }

        try {
            $prompt = $this->buildPrompt($review);
            $response = $this->gemini->generateCompletion($prompt, [
                'temperature' => 0.3, // More deterministic for classification
                'max_tokens' => 200,
            ]);

            return $this->parseResponse($response['content'], $review->rating);
        } catch (\Exception $e) {
            Log::warning('Sentiment analysis via AI failed, falling back to rating', [
                'review_id' => $review->id,
                'error' => $e->getMessage(),
            ]);

            // Fallback to rating-based analysis
            return $this->analyzeFromRating($review->rating);
        }
    }

    /**
     * Build the prompt for Gemini sentiment analysis.
     */
    private function buildPrompt(Review $review): string
    {
        $content = $this->sanitizeContent($review->content);
        $rating = $review->rating ?? 'unknown';

        return <<<PROMPT
Analyze the sentiment of this customer review and extract themes.

Review content: "{$content}"
Rating: {$rating}/5

Return a JSON object with:
- "score": float between 0.0 (very negative) and 1.0 (very positive)
- "themes": array of detected themes from this list ONLY: ["service", "cleanliness", "price", "quality", "welcome", "location", "ambiance", "value_for_money"]

Rules:
- The score should reflect the overall sentiment, considering both the text and rating
- Only include themes that are explicitly or strongly implied in the review
- If the review is in a non-English language, still analyze it correctly
- Return ONLY the JSON object, no explanation or markdown

Example output:
{"score": 0.75, "themes": ["service", "welcome"]}
PROMPT;
    }

    /**
     * Sanitize review content to prevent prompt injection.
     */
    private function sanitizeContent(string $content): string
    {
        // Remove potential prompt injection patterns
        $content = preg_replace('/```[\s\S]*```/', '', $content);
        $content = preg_replace('/\{[\s\S]*\}/', '', $content);

        // Limit length to prevent token overflow
        if (strlen($content) > 2000) {
            $content = substr($content, 0, 2000) . '...';
        }

        // Escape quotes
        return addslashes(trim($content));
    }

    /**
     * Analyze sentiment based on rating alone (fallback).
     *
     * @param int|null $rating The review rating (1-5)
     */
    public function analyzeFromRating(?int $rating): SentimentResult
    {
        $score = match ($rating) {
            1 => 0.1,
            2 => 0.3,
            3 => 0.5,
            4 => 0.7,
            5 => 0.9,
            default => 0.5,
        };

        return new SentimentResult(
            score: $score,
            label: $this->getLabelFromScore($score),
            themes: []
        );
    }

    /**
     * Get sentiment label from score.
     *
     * @param float $score The sentiment score (0.0-1.0)
     * @return string The sentiment label
     */
    public function getLabelFromScore(float $score): string
    {
        return match (true) {
            $score >= 0.6 => 'positive',
            $score < 0.4 => 'negative',
            default => 'neutral',
        };
    }

    /**
     * Parse the AI response into a SentimentResult.
     *
     * @param string $content The raw AI response
     * @param int|null $rating The original rating for fallback
     * @throws \RuntimeException If response cannot be parsed
     */
    private function parseResponse(string $content, ?int $rating): SentimentResult
    {
        // Try to extract JSON from the response
        $json = $this->extractJson($content);

        if ($json === null) {
            Log::warning('Could not parse sentiment JSON, falling back to rating', [
                'response' => substr($content, 0, 500),
            ]);
            return $this->analyzeFromRating($rating);
        }

        // Validate and normalize score
        $score = isset($json['score']) ? (float) $json['score'] : 0.5;
        $score = max(0.0, min(1.0, $score)); // Clamp between 0 and 1

        // Validate themes
        $themes = $this->validateThemes($json['themes'] ?? []);

        return new SentimentResult(
            score: $score,
            label: $this->getLabelFromScore($score),
            themes: $themes
        );
    }

    /**
     * Extract JSON from AI response (handles markdown code blocks).
     *
     * @param string $content The raw response
     * @return array|null The parsed JSON or null if invalid
     */
    private function extractJson(string $content): ?array
    {
        // Try direct JSON parse first
        $json = json_decode($content, true);
        if ($json !== null && isset($json['score'])) {
            return $json;
        }

        // Try to extract from markdown code block
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $content, $matches)) {
            $json = json_decode($matches[1], true);
            if ($json !== null && isset($json['score'])) {
                return $json;
            }
        }

        // Try to find JSON object in text
        if (preg_match('/\{[^{}]*"score"\s*:\s*[\d.]+[^{}]*\}/', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json !== null) {
                return $json;
            }
        }

        return null;
    }

    /**
     * Validate and filter themes to only include valid ones.
     *
     * @param array $themes The themes from AI response
     * @return array<string> Valid themes only
     */
    private function validateThemes(array $themes): array
    {
        return array_values(array_filter(
            $themes,
            fn($theme) => in_array($theme, SentimentResult::VALID_THEMES, true)
        ));
    }
}
