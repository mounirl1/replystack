<?php

namespace App\Services\Language;

/**
 * Data Transfer Object for language detection results.
 */
readonly class LanguageDetectionResult
{
    /**
     * @param string $language The detected ISO 639-1 language code
     * @param float $confidence Confidence score between 0 and 1
     * @param bool $isReliable Whether the detection is considered reliable
     * @param array<string, float> $allScores Optional scores for all detected languages
     */
    public function __construct(
        public string $language,
        public float $confidence,
        public bool $isReliable,
        public array $allScores = []
    ) {}

    /**
     * Get the full language name.
     */
    public function getLanguageName(): string
    {
        return self::LANGUAGE_NAMES[$this->language] ?? $this->language;
    }

    /**
     * Check if the detected language matches the given code.
     */
    public function is(string $languageCode): bool
    {
        return $this->language === $languageCode;
    }

    /**
     * Check if the language is one of the given codes.
     */
    public function isOneOf(array $languageCodes): bool
    {
        return in_array($this->language, $languageCodes);
    }

    /**
     * Convert to array.
     *
     * @return array{language: string, confidence: float, is_reliable: bool, language_name: string}
     */
    public function toArray(): array
    {
        return [
            'language' => $this->language,
            'confidence' => round($this->confidence, 3),
            'is_reliable' => $this->isReliable,
            'language_name' => $this->getLanguageName(),
        ];
    }

    /**
     * Human-readable language names.
     */
    private const LANGUAGE_NAMES = [
        'en' => 'English',
        'fr' => 'French',
        'es' => 'Spanish',
        'de' => 'German',
        'it' => 'Italian',
        'pt' => 'Portuguese',
        'nl' => 'Dutch',
        'ja' => 'Japanese',
        'zh' => 'Chinese',
        'ko' => 'Korean',
        'ar' => 'Arabic',
        'ru' => 'Russian',
    ];
}
