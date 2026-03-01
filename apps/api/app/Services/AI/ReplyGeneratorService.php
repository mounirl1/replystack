<?php

namespace App\Services\AI;

use App\Enums\ResponseLength;
use App\Enums\ResponseTone;
use App\Models\Location;
use App\Models\LocationResponseProfile;
use App\Models\User;
use App\Services\Language\LanguageDetectorService;

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
        private readonly AIProviderFactory $providerFactory,
        private readonly LanguageDetectorService $languageDetector
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
     * @param User|null $user The user making the request (for provider selection)
     * @return array{
     *     reply: string,
     *     tone: string,
     *     language: string,
     *     length: string,
     *     tokens_used: int,
     *     generation_time_ms: int,
     *     provider: string
     * }
     */
    public function generate(array $review, array $options = [], ?User $user = null): array
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

        // Get the appropriate AI provider for the user
        $provider = $user
            ? $this->providerFactory->forUser($user)
            : $this->providerFactory->make();

        $result = $provider->generateCompletion($prompt, [
            'max_tokens' => $maxTokens,
            'temperature' => 0.7,
        ]);

        // Detect language if set to auto
        $detectedLanguage = $language === 'auto'
            ? $this->languageDetector->detectLanguageCode($review['content'] ?? '')
            : $language;

        return [
            'reply' => trim($result['content']),
            'tone' => $tone,
            'language' => $detectedLanguage,
            'length' => $length,
            'tokens_used' => $result['tokens_used'],
            'generation_time_ms' => $result['generation_time_ms'],
            'provider' => $provider->getProviderName(),
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

        // Sanitize user inputs to prevent prompt injection
        $sanitizedContent = $this->sanitizeInput($review['content'] ?? '');
        $sanitizedAuthor = $this->sanitizeInput($review['author'] ?? 'Anonymous');
        $sanitizedPlatform = $this->sanitizeInput($review['platform']);

        // Handle rating-only reviews (no content)
        $reviewSection = empty(trim($sanitizedContent))
            ? "Note : {$review['rating']}/5 (avis sans commentaire, note seule)\nAuteur : {$sanitizedAuthor}"
            : "Plateforme : {$sanitizedPlatform}\nNote : {$review['rating']}/5\nAuteur : {$sanitizedAuthor}\nAvis : {$sanitizedContent}";

        $ratingOnlyInstruction = empty(trim($sanitizedContent))
            ? "\n\n## Note importante\nCet avis ne contient qu'une note sans commentaire. Génère une réponse courte et appropriée basée uniquement sur la note."
            : '';

        return <<<PROMPT
{$systemPrompt}

## Langue
{$languageInstruction}{$ratingOnlyInstruction}

## Avis à traiter
{$reviewSection}

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
        $locationContext = $location ? "Etablissement : " . $this->sanitizeInput($location->name) . "\n" : '';
        $ratingContext = $this->getRatingContext($review['rating']);

        // Sanitize user inputs to prevent prompt injection
        $sanitizedContent = $this->sanitizeInput($review['content'] ?? '');
        $sanitizedAuthor = $this->sanitizeInput($review['author'] ?? 'Anonymous');
        $sanitizedPlatform = $this->sanitizeInput($review['platform']);

        // Handle rating-only reviews (no content)
        $isRatingOnly = empty(trim($sanitizedContent));

        if ($isRatingOnly) {
            $reviewInfo = "Note : {$review['rating']}/5 (avis sans commentaire)\nAuteur : {$sanitizedAuthor}";
            $personalizationInstruction = "- Genere une reponse courte et appropriee basee uniquement sur la note.";
        } else {
            $reviewInfo = "Plateforme : {$sanitizedPlatform}\nNote : {$review['rating']}/5\nAuteur : {$sanitizedAuthor}\nAvis : {$sanitizedContent}";
            $personalizationInstruction = "- Personnalise la reponse en mentionnant des elements specifiques de l'avis.";
        }

        return <<<PROMPT
Tu es un assistant specialise dans la redaction de reponses aux avis clients.

{$locationContext}{$reviewInfo}

Instructions :
- {$toneInstructions}
- {$languageInstruction}
- {$ratingContext}
- La reponse doit faire entre 50 et 150 mots.
- Ne fais pas de promesses impossibles a tenir.
- N'utilise pas de formules generiques type "Cher client".
{$personalizationInstruction}
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
            'ja' => 'japonais',
            'zh' => 'chinois',
            'ko' => 'coreen',
            'ar' => 'arabe',
            'ru' => 'russe',
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
     * Validate review data.
     */
    public function validateReviewData(array $review): array
    {
        $errors = [];

        // Content is now optional (rating-only reviews are allowed)

        if (!isset($review['rating']) || $review['rating'] < 1 || $review['rating'] > 5) {
            $errors[] = 'Rating must be between 1 and 5.';
        }

        // Author is optional, will default to 'Anonymous'

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

    /**
     * Sanitize user input to prevent prompt injection attacks.
     *
     * Removes potentially dangerous characters and patterns that could
     * be used to manipulate the AI prompt.
     *
     * @param string $text The text to sanitize
     * @return string The sanitized text
     */
    private function sanitizeInput(string $text): string
    {
        // Strip HTML tags
        $text = strip_tags($text);

        // Limit maximum length to prevent excessively long inputs
        $text = mb_substr($text, 0, 5000);

        // Remove potential prompt injection patterns (case-insensitive)
        // These patterns could be used to escape the user content section
        $dangerousPatterns = [
            '{{',           // Template markers
            '}}',
            '<|',           // Claude/GPT system tokens
            '|>',
            '```',          // Code blocks (could be used to inject instructions)
            'PROMPT',       // Prevent breaking out of heredoc
            'Instructions:', // Prevent adding fake instructions
            'System:',      // Prevent fake system messages
            'Assistant:',   // Prevent fake assistant messages
            'Human:',       // Prevent fake human messages
            'User:',        // Prevent fake user messages (Gemini/Mistral)
            'Model:',       // Prevent fake model messages (Gemini)
            '[INST]',       // Mistral instruction tokens
            '[/INST]',
        ];

        // Apply filter in a loop until stable (prevents bypass via nesting)
        $maxIterations = 5;
        for ($i = 0; $i < $maxIterations; $i++) {
            $previous = $text;
            foreach ($dangerousPatterns as $pattern) {
                $text = str_ireplace($pattern, '', $text);
            }
            if ($text === $previous) {
                break;
            }
        }

        // Normalize whitespace (collapse multiple spaces/newlines)
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text;
    }
}
