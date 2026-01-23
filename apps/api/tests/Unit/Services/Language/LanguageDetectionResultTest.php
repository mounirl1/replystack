<?php

namespace Tests\Unit\Services\Language;

use App\Services\Language\LanguageDetectionResult;
use PHPUnit\Framework\TestCase;

class LanguageDetectionResultTest extends TestCase
{
    public function test_creates_result_with_correct_properties(): void
    {
        $result = new LanguageDetectionResult(
            language: 'fr',
            confidence: 0.85,
            isReliable: true,
            allScores: ['fr' => 0.85, 'en' => 0.15]
        );

        $this->assertEquals('fr', $result->language);
        $this->assertEquals(0.85, $result->confidence);
        $this->assertTrue($result->isReliable);
        $this->assertEquals(['fr' => 0.85, 'en' => 0.15], $result->allScores);
    }

    public function test_creates_result_with_default_all_scores(): void
    {
        $result = new LanguageDetectionResult(
            language: 'en',
            confidence: 0.7,
            isReliable: true
        );

        $this->assertEquals([], $result->allScores);
    }

    public function test_get_language_name_returns_correct_names(): void
    {
        $languages = [
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

        foreach ($languages as $code => $name) {
            $result = new LanguageDetectionResult(
                language: $code,
                confidence: 0.8,
                isReliable: true
            );

            $this->assertEquals($name, $result->getLanguageName(), "Failed for language code: {$code}");
        }
    }

    public function test_get_language_name_returns_code_for_unknown(): void
    {
        $result = new LanguageDetectionResult(
            language: 'unknown',
            confidence: 0.5,
            isReliable: false
        );

        $this->assertEquals('unknown', $result->getLanguageName());
    }

    public function test_is_returns_true_for_matching_language(): void
    {
        $result = new LanguageDetectionResult(
            language: 'fr',
            confidence: 0.9,
            isReliable: true
        );

        $this->assertTrue($result->is('fr'));
    }

    public function test_is_returns_false_for_non_matching_language(): void
    {
        $result = new LanguageDetectionResult(
            language: 'fr',
            confidence: 0.9,
            isReliable: true
        );

        $this->assertFalse($result->is('en'));
        $this->assertFalse($result->is('de'));
    }

    public function test_is_one_of_returns_true_when_language_in_list(): void
    {
        $result = new LanguageDetectionResult(
            language: 'es',
            confidence: 0.8,
            isReliable: true
        );

        $this->assertTrue($result->isOneOf(['en', 'fr', 'es', 'de']));
    }

    public function test_is_one_of_returns_false_when_language_not_in_list(): void
    {
        $result = new LanguageDetectionResult(
            language: 'ja',
            confidence: 0.9,
            isReliable: true
        );

        $this->assertFalse($result->isOneOf(['en', 'fr', 'es', 'de']));
    }

    public function test_to_array_returns_correct_structure(): void
    {
        $result = new LanguageDetectionResult(
            language: 'en',
            confidence: 0.756,
            isReliable: true
        );

        $array = $result->toArray();

        $this->assertArrayHasKey('language', $array);
        $this->assertArrayHasKey('confidence', $array);
        $this->assertArrayHasKey('is_reliable', $array);
        $this->assertArrayHasKey('language_name', $array);

        $this->assertEquals('en', $array['language']);
        $this->assertEquals(0.756, $array['confidence']); // Rounded to 3 decimal places
        $this->assertTrue($array['is_reliable']);
        $this->assertEquals('English', $array['language_name']);
    }

    public function test_to_array_rounds_confidence(): void
    {
        $result = new LanguageDetectionResult(
            language: 'fr',
            confidence: 0.12345678,
            isReliable: false
        );

        $array = $result->toArray();

        $this->assertEquals(0.123, $array['confidence']);
    }

    public function test_unreliable_result(): void
    {
        $result = new LanguageDetectionResult(
            language: 'en',
            confidence: 0.1,
            isReliable: false
        );

        $this->assertFalse($result->isReliable);
        $array = $result->toArray();
        $this->assertFalse($array['is_reliable']);
    }
}
