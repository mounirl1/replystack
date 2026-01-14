<?php

namespace App\Services\AI;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for generating AI-powered review summaries.
 */
class ReviewSummaryService
{
    public function __construct(
        private readonly AIProviderFactory $providerFactory
    ) {}

    /**
     * Generate a summary from a collection of reviews.
     *
     * @param Collection $reviews The reviews to summarize
     * @param string $language Target language (default: auto-detect)
     * @param User|null $user The user making the request (for provider selection)
     * @return array{
     *     summary: string,
     *     strengths: array,
     *     improvements: array,
     *     keywords: array,
     *     tokens_used: int,
     *     generation_time_ms: int,
     *     provider: string
     * }
     */
    public function generate(Collection $reviews, string $language = 'auto', ?User $user = null): array
    {
        $reviewsText = $reviews->map(function ($review) {
            $rating = $review->rating;
            $content = $this->sanitizeInput($review->content);
            return "Note: {$rating}/5 - {$content}";
        })->join("\n---\n");

        $languageInstruction = $language === 'auto'
            ? "Détecte la langue principale des avis et réponds dans cette langue."
            : "Réponds en " . $this->getLanguageName($language) . ".";

        $prompt = <<<PROMPT
Tu es un expert en analyse de retours clients. Analyse les avis clients suivants et génère un résumé structuré.

## AVIS À ANALYSER ({$reviews->count()} avis)
{$reviewsText}

## INSTRUCTIONS
{$languageInstruction}

Tu dois répondre UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après. Utilise exactement cette structure :

{
    "summary": "Résumé global en 2-3 phrases décrivant les tendances principales des avis",
    "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
    "improvements": ["Axe amélioration 1", "Axe amélioration 2"],
    "keywords": ["mot-clé1", "mot-clé2", "mot-clé3", "mot-clé4", "mot-clé5"]
}

## RÈGLES
- summary: Synthèse objective des tendances principales (pas plus de 3 phrases)
- strengths: Exactement 3 aspects positifs récurrents dans les avis
- improvements: Exactement 2 points à améliorer (même si les avis sont globalement positifs)
- keywords: Exactement 5 termes significatifs ou fréquents extraits des avis
- Si la majorité des avis sont négatifs, adapte le ton du résumé en conséquence
- Ne jamais inventer d'informations non présentes dans les avis

JSON:
PROMPT;

        try {
            // Get the appropriate AI provider for the user
            $provider = $user
                ? $this->providerFactory->forUser($user)
                : $this->providerFactory->make();

            $result = $provider->generateCompletion($prompt, [
                'max_tokens' => 800,
                'temperature' => 0.3, // Lower temperature for more consistent JSON output
            ]);

            $parsed = $this->parseJsonResponse($result['content']);

            return [
                'summary' => $parsed['summary'],
                'strengths' => $parsed['strengths'],
                'improvements' => $parsed['improvements'],
                'keywords' => $parsed['keywords'],
                'tokens_used' => $result['tokens_used'],
                'generation_time_ms' => $result['generation_time_ms'],
                'provider' => $provider->getProviderName(),
            ];
        } catch (\Exception $e) {
            Log::error('Review summary generation failed', [
                'error' => $e->getMessage(),
                'review_count' => $reviews->count(),
            ]);
            throw $e;
        }
    }

    /**
     * Parse JSON response from Claude, handling potential formatting issues.
     */
    private function parseJsonResponse(string $content): array
    {
        // Try to extract JSON from the response (in case there's extra text)
        $jsonMatch = preg_match('/\{[\s\S]*\}/', $content, $matches);
        $jsonString = $jsonMatch ? $matches[0] : $content;

        $parsed = json_decode($jsonString, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('Failed to parse JSON response from Claude', [
                'content' => $content,
                'error' => json_last_error_msg(),
            ]);

            // Return default structure if parsing fails
            return [
                'summary' => 'Unable to generate summary. Please try again.',
                'strengths' => ['N/A', 'N/A', 'N/A'],
                'improvements' => ['N/A', 'N/A'],
                'keywords' => ['N/A', 'N/A', 'N/A', 'N/A', 'N/A'],
            ];
        }

        // Validate and normalize the response
        return [
            'summary' => $parsed['summary'] ?? 'No summary available.',
            'strengths' => array_slice($parsed['strengths'] ?? [], 0, 3),
            'improvements' => array_slice($parsed['improvements'] ?? [], 0, 2),
            'keywords' => array_slice($parsed['keywords'] ?? [], 0, 5),
        ];
    }

    /**
     * Get full language name from code.
     */
    private function getLanguageName(string $code): string
    {
        $languages = [
            'fr' => 'français',
            'en' => 'anglais',
            'es' => 'espagnol',
            'de' => 'allemand',
            'it' => 'italien',
            'pt' => 'portugais',
            'nl' => 'néerlandais',
        ];

        return $languages[$code] ?? $code;
    }

    /**
     * Sanitize user input to prevent prompt injection.
     */
    private function sanitizeInput(string $text): string
    {
        // Strip HTML tags
        $text = strip_tags($text);

        // Limit maximum length
        $text = mb_substr($text, 0, 2000);

        // Remove potential prompt injection patterns
        $dangerousPatterns = [
            '{{', '}}',
            '<|', '|>',
            '```',
            'PROMPT',
            'Instructions:',
            'System:',
            'Assistant:',
            'Human:',
        ];

        foreach ($dangerousPatterns as $pattern) {
            $text = str_replace($pattern, '', $text);
        }

        // Normalize whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }
}
