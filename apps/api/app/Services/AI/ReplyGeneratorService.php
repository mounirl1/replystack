<?php

namespace App\Services\AI;

use App\Enums\ResponseLength;
use App\Enums\ResponseTone;
use App\Models\Location;
use App\Models\LocationResponseProfile;

/**
 * Service for generating AI-powered review replies.
 */
class ReplyGeneratorService
{
    /**
     * Supported tones for reply generation (legacy).
     */
    public const TONES = ['professional', 'friendly', 'formal', 'casual', 'warm', 'luxury', 'dynamic'];

    /**
     * Supported platforms.
     */
    public const PLATFORMS = [
        'google',
        'tripadvisor',
        'booking',
        'yelp',
        'facebook',
        'g2',
        'capterra',
        'trustpilot',
    ];

    public function __construct(
        private readonly ClaudeService $claude
    ) {}

    /**
     * Generate a reply for a review.
     *
     * @param array{
     *     content: string,
     *     rating: int,
     *     author: string,
     *     platform: string
     * } $review The review data
     * @param array{
     *     tone?: string,
     *     language?: string,
     *     length?: string,
     *     location?: Location|null,
     *     specific_context?: string|null
     * } $options Generation options
     * @return array{
     *     reply: string,
     *     tone: string,
     *     language: string,
     *     length: string,
     *     tokens_used: int,
     *     generation_time_ms: int
     * }
     */
    public function generate(array $review, array $options = []): array
    {
        $location = $options['location'] ?? null;
        $profile = $location?->responseProfile;

        // Determine settings from profile or defaults
        $tone = $options['tone'] ?? $profile?->tone ?? 'professional';
        $length = $options['length'] ?? $profile?->default_length ?? 'medium';
        $language = $options['language'] ?? 'auto';
        $specificContext = $options['specific_context'] ?? null;

        // Build the prompt
        if ($profile && $profile->onboarding_completed) {
            $prompt = $this->buildProfileBasedPrompt($review, $profile, $specificContext, $tone, $length, $language);
        } else {
            $prompt = $this->buildLegacyPrompt($review, $tone, $language, $location);
        }

        // Determine max tokens based on length
        $lengthEnum = ResponseLength::tryFrom($length) ?? ResponseLength::MEDIUM;
        $maxTokens = $lengthEnum->maxTokens();

        $result = $this->claude->generateCompletion($prompt, [
            'model' => 'claude-3-haiku-20240307',
            'max_tokens' => $maxTokens,
            'temperature' => 0.7,
        ]);

        // Detect language if set to auto
        $detectedLanguage = $language === 'auto'
            ? $this->detectLanguage($review['content'])
            : $language;

        return [
            'reply' => trim($result['content']),
            'tone' => $tone,
            'language' => $detectedLanguage,
            'length' => $length,
            'tokens_used' => $result['tokens_used'],
            'generation_time_ms' => $result['generation_time_ms'],
        ];
    }

    /**
     * Build the prompt using the location's response profile.
     */
    private function buildProfileBasedPrompt(
        array $review,
        LocationResponseProfile $profile,
        ?string $specificContext,
        string $tone,
        string $length,
        string $language
    ): string {
        $systemPrompt = $profile->buildSystemPrompt(
            $review['rating'],
            $specificContext,
            $tone !== $profile->tone ? $tone : null,
            $length !== $profile->default_length ? $length : null
        );

        $languageInstruction = $this->getLanguageInstruction($language);

        return <<<PROMPT
{$systemPrompt}

## Langue
{$languageInstruction}

## Avis à traiter
Plateforme : {$review['platform']}
Note : {$review['rating']}/5
Auteur : {$review['author']}
Avis : {$review['content']}

Génère maintenant la réponse :
PROMPT;
    }

    /**
     * Build the legacy prompt for Claude (when no profile exists).
     */
    private function buildLegacyPrompt(
        array $review,
        string $tone,
        string $language,
        ?Location $location
    ): string {
        $toneInstructions = $this->getToneInstructions($tone);
        $languageInstruction = $this->getLanguageInstruction($language);
        $locationContext = $location ? "Etablissement : {$location->name}\n" : '';
        $ratingContext = $this->getRatingContext($review['rating']);

        return <<<PROMPT
Tu es un assistant specialise dans la redaction de reponses aux avis clients.

{$locationContext}Plateforme : {$review['platform']}
Note : {$review['rating']}/5
Auteur : {$review['author']}
Avis : {$review['content']}

Instructions :
- {$toneInstructions}
- {$languageInstruction}
- {$ratingContext}
- La reponse doit faire entre 50 et 150 mots.
- Ne fais pas de promesses impossibles a tenir.
- N'utilise pas de formules generiques type "Cher client".
- Personnalise la reponse en mentionnant des elements specifiques de l'avis.
- Termine par une invitation a revenir ou a contacter l'etablissement si besoin.

Genere uniquement la reponse, sans introduction ni explication.
PROMPT;
    }

    /**
     * Get tone-specific instructions (legacy).
     */
    private function getToneInstructions(string $tone): string
    {
        return match ($tone) {
            'professional' => 'Adopte un ton professionnel et courtois.',
            'friendly', 'warm' => 'Adopte un ton chaleureux et amical, comme un ami.',
            'formal' => 'Adopte un ton tres formel et respectueux.',
            'casual' => 'Adopte un ton decontracte mais respectueux.',
            'luxury' => 'Adopte un ton raffiné et élégant, digne d\'un établissement premium.',
            'dynamic' => 'Adopte un ton énergique et enthousiaste.',
            default => 'Adopte un ton professionnel et courtois.',
        };
    }

    /**
     * Get language instruction.
     */
    private function getLanguageInstruction(string $language): string
    {
        if ($language === 'auto') {
            return "Reponds dans la meme langue que l'avis.";
        }

        $languageNames = [
            'fr' => 'francais',
            'en' => 'anglais',
            'es' => 'espagnol',
            'de' => 'allemand',
            'it' => 'italien',
            'pt' => 'portugais',
            'nl' => 'neerlandais',
        ];

        $languageName = $languageNames[$language] ?? $language;

        return "Reponds en {$languageName}.";
    }

    /**
     * Get rating-specific context instructions.
     */
    private function getRatingContext(int $rating): string
    {
        return match (true) {
            $rating <= 2 => "Cet avis est negatif. Montre de l'empathie, presente des excuses sinceres, et propose une solution ou un suivi.",
            $rating == 3 => "Cet avis est mitige. Remercie pour le feedback constructif et mentionne les points d'amelioration.",
            default => 'Cet avis est positif. Remercie chaleureusement et invite a revenir.',
        };
    }

    /**
     * Detect language from text content.
     *
     * Simple pattern-based detection. In production, could use a dedicated service.
     */
    private function detectLanguage(string $text): string
    {
        $patterns = [
            'fr' => '/\b(le|la|les|de|du|des|et|est|sont|nous|vous|merci|bonjour|tres|bien|avec)\b/i',
            'en' => '/\b(the|is|are|was|were|have|has|thank|hello|great|good|very|with)\b/i',
            'es' => '/\b(el|la|los|las|de|del|y|es|son|gracias|hola|muy|bien|con)\b/i',
            'de' => '/\b(der|die|das|und|ist|sind|haben|danke|guten|sehr|gut|mit)\b/i',
            'it' => '/\b(il|la|i|le|di|del|e|e|sono|grazie|buon|molto|bene|con)\b/i',
            'pt' => '/\b(o|a|os|as|de|do|e|e|sao|obrigado|bom|muito|bem|com)\b/i',
            'nl' => '/\b(de|het|een|en|is|zijn|hebben|dank|goed|zeer|wel|met)\b/i',
        ];

        $scores = [];
        foreach ($patterns as $lang => $pattern) {
            preg_match_all($pattern, $text, $matches);
            $scores[$lang] = count($matches[0]);
        }

        arsort($scores);
        $topLang = array_key_first($scores);

        // Return the language with highest score, default to 'en' if no matches
        return ($scores[$topLang] ?? 0) > 0 ? $topLang : 'en';
    }

    /**
     * Validate review data.
     */
    public function validateReviewData(array $review): array
    {
        $errors = [];

        if (empty($review['content'])) {
            $errors[] = 'Review content is required.';
        }

        if (!isset($review['rating']) || $review['rating'] < 1 || $review['rating'] > 5) {
            $errors[] = 'Rating must be between 1 and 5.';
        }

        if (empty($review['author'])) {
            $errors[] = 'Author name is required.';
        }

        if (empty($review['platform']) || !in_array($review['platform'], self::PLATFORMS)) {
            $errors[] = 'Valid platform is required.';
        }

        return $errors;
    }

    /**
     * Validate generation options.
     */
    public function validateOptions(array $options): array
    {
        $errors = [];

        if (isset($options['tone']) && !in_array($options['tone'], self::TONES)) {
            $errors[] = 'Invalid tone. Must be one of: ' . implode(', ', self::TONES);
        }

        $validLengths = ResponseLength::values();
        if (isset($options['length']) && !in_array($options['length'], $validLengths)) {
            $errors[] = 'Invalid length. Must be one of: ' . implode(', ', $validLengths);
        }

        return $errors;
    }
}
