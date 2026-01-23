<?php

namespace Tests\Unit\Services\Sentiment;

use App\Services\Sentiment\SentimentResult;
use PHPUnit\Framework\TestCase;

class SentimentResultTest extends TestCase
{
    public function test_creates_sentiment_result_with_correct_properties(): void
    {
        $result = new SentimentResult(
            score: 0.85,
            label: 'positive',
            themes: ['service', 'quality']
        );

        $this->assertEquals(0.85, $result->score);
        $this->assertEquals('positive', $result->label);
        $this->assertEquals(['service', 'quality'], $result->themes);
    }

    public function test_to_array_returns_correct_structure(): void
    {
        $result = new SentimentResult(
            score: 0.65,
            label: 'positive',
            themes: ['service']
        );

        $array = $result->toArray();

        $this->assertIsArray($array);
        $this->assertArrayHasKey('score', $array);
        $this->assertArrayHasKey('label', $array);
        $this->assertArrayHasKey('themes', $array);
        $this->assertEquals(0.65, $array['score']);
        $this->assertEquals('positive', $array['label']);
        $this->assertEquals(['service'], $array['themes']);
    }

    public function test_is_positive_returns_true_for_positive_label(): void
    {
        $result = new SentimentResult(score: 0.8, label: 'positive', themes: []);

        $this->assertTrue($result->isPositive());
        $this->assertFalse($result->isNegative());
        $this->assertFalse($result->isNeutral());
    }

    public function test_is_negative_returns_true_for_negative_label(): void
    {
        $result = new SentimentResult(score: 0.2, label: 'negative', themes: []);

        $this->assertTrue($result->isNegative());
        $this->assertFalse($result->isPositive());
        $this->assertFalse($result->isNeutral());
    }

    public function test_is_neutral_returns_true_for_neutral_label(): void
    {
        $result = new SentimentResult(score: 0.5, label: 'neutral', themes: []);

        $this->assertTrue($result->isNeutral());
        $this->assertFalse($result->isPositive());
        $this->assertFalse($result->isNegative());
    }

    public function test_has_theme_returns_true_when_theme_exists(): void
    {
        $result = new SentimentResult(
            score: 0.7,
            label: 'positive',
            themes: ['service', 'quality', 'welcome']
        );

        $this->assertTrue($result->hasTheme('service'));
        $this->assertTrue($result->hasTheme('quality'));
        $this->assertTrue($result->hasTheme('welcome'));
    }

    public function test_has_theme_returns_false_when_theme_not_exists(): void
    {
        $result = new SentimentResult(
            score: 0.7,
            label: 'positive',
            themes: ['service']
        );

        $this->assertFalse($result->hasTheme('quality'));
        $this->assertFalse($result->hasTheme('price'));
        $this->assertFalse($result->hasTheme('location'));
    }

    public function test_valid_themes_constant_contains_expected_themes(): void
    {
        $expectedThemes = [
            'service',
            'cleanliness',
            'price',
            'quality',
            'welcome',
            'location',
            'ambiance',
            'value_for_money',
        ];

        $this->assertEquals($expectedThemes, SentimentResult::VALID_THEMES);
    }

    public function test_empty_themes_array_is_valid(): void
    {
        $result = new SentimentResult(score: 0.5, label: 'neutral', themes: []);

        $this->assertEmpty($result->themes);
        $this->assertFalse($result->hasTheme('service'));
    }
}
