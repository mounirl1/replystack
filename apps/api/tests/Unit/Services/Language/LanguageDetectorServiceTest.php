<?php

namespace Tests\Unit\Services\Language;

use App\Services\Language\LanguageDetectionResult;
use App\Services\Language\LanguageDetectorService;
use PHPUnit\Framework\TestCase;

class LanguageDetectorServiceTest extends TestCase
{
    private LanguageDetectorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LanguageDetectorService();
    }

    // ========================================
    // Latin-based Languages Tests
    // ========================================

    /**
     * @dataProvider frenchTextsProvider
     */
    public function test_detects_french_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('fr', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function frenchTextsProvider(): array
    {
        return [
            'simple review' => ['Merci beaucoup pour le service, nous avons très bien mangé'],
            'positive review' => ['Excellent restaurant, le personnel est très sympathique et la cuisine délicieuse'],
            'negative review' => ['Service trop lent, nous avons attendu une heure pour notre plat principal'],
            'mixed review' => ['Le cadre est agréable mais les prix sont un peu élevés pour la qualité'],
            'short positive' => ['Merci pour cette belle expérience, nous reviendrons avec plaisir'],
        ];
    }

    /**
     * @dataProvider englishTextsProvider
     */
    public function test_detects_english_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('en', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function englishTextsProvider(): array
    {
        return [
            'simple review' => ['Thank you very much for the great service, the food was delicious'],
            'positive review' => ['Amazing restaurant with excellent service and wonderful atmosphere'],
            'negative review' => ['The service was terrible and we waited too long for our food'],
            'detailed review' => ['We had a wonderful experience at this hotel. The staff was friendly and helpful'],
            'recommendation' => ['Highly recommend this place to anyone looking for great food and service'],
        ];
    }

    /**
     * @dataProvider spanishTextsProvider
     */
    public function test_detects_spanish_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('es', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function spanishTextsProvider(): array
    {
        return [
            'simple review' => ['Muchas gracias por el servicio, la comida estaba muy buena'],
            'positive review' => ['Excelente restaurante, el personal es muy amable y la comida deliciosa'],
            'recommendation' => ['Recomiendo este lugar a todos, es perfecto para una cena especial'],
        ];
    }

    /**
     * @dataProvider germanTextsProvider
     */
    public function test_detects_german_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('de', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function germanTextsProvider(): array
    {
        return [
            'simple review' => ['Vielen Dank für den sehr guten Service und das leckere Essen'],
            'positive review' => ['Tolles Restaurant mit ausgezeichnetem Service und wunderbarer Atmosphäre'],
            'recommendation' => ['Ich empfehle dieses Hotel sehr, das Personal war sehr freundlich'],
        ];
    }

    /**
     * @dataProvider italianTextsProvider
     */
    public function test_detects_italian_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('it', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function italianTextsProvider(): array
    {
        return [
            'simple review' => ['Grazie mille per il servizio, il cibo era molto buono'],
            'positive review' => ['Ottimo ristorante con servizio eccellente e atmosfera meravigliosa'],
            'recommendation' => ['Consiglio questo posto a tutti, perfetto per una cena speciale'],
        ];
    }

    /**
     * @dataProvider portugueseTextsProvider
     */
    public function test_detects_portuguese_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('pt', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function portugueseTextsProvider(): array
    {
        return [
            'simple review' => ['Muito obrigado pelo serviço, a comida estava muito boa'],
            'positive review' => ['Excelente restaurante com serviço maravilhoso e ambiente fantástico'],
            'recommendation' => ['Recomendo este lugar para todos que procuram boa comida'],
        ];
    }

    /**
     * @dataProvider dutchTextsProvider
     */
    public function test_detects_dutch_correctly(string $text): void
    {
        $result = $this->service->detect($text);

        $this->assertEquals('nl', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public static function dutchTextsProvider(): array
    {
        return [
            'simple review' => ['Heel erg bedankt voor de goede service en het heerlijke eten'],
            'positive review' => ['Fantastisch restaurant met uitstekende service en geweldige sfeer'],
            'recommendation' => ['Ik beveel dit hotel aan, het personeel was zeer vriendelijk'],
        ];
    }

    // ========================================
    // Non-Latin Script Tests
    // ========================================

    public function test_detects_japanese_correctly(): void
    {
        $text = 'このレストランはとても美味しかったです。サービスも素晴らしかったです。';

        $result = $this->service->detect($text);

        $this->assertEquals('ja', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public function test_detects_japanese_with_kanji(): void
    {
        $text = '料理が美味しくて、雰囲気も最高でした。また来たいと思います。';

        $result = $this->service->detect($text);

        $this->assertEquals('ja', $result->language);
    }

    public function test_detects_chinese_correctly(): void
    {
        $text = '这家餐厅非常好吃，服务也很周到。强烈推荐！';

        $result = $this->service->detect($text);

        $this->assertEquals('zh', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public function test_detects_korean_correctly(): void
    {
        $text = '이 레스토랑은 정말 맛있었습니다. 서비스도 훌륭했습니다.';

        $result = $this->service->detect($text);

        $this->assertEquals('ko', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public function test_detects_arabic_correctly(): void
    {
        $text = 'مطعم ممتاز والخدمة رائعة. أنصح الجميع بزيارته.';

        $result = $this->service->detect($text);

        $this->assertEquals('ar', $result->language);
        $this->assertTrue($result->isReliable);
    }

    public function test_detects_russian_correctly(): void
    {
        $text = 'Отличный ресторан с превосходным обслуживанием. Очень рекомендую!';

        $result = $this->service->detect($text);

        $this->assertEquals('ru', $result->language);
        $this->assertTrue($result->isReliable);
    }

    // ========================================
    // Edge Cases Tests
    // ========================================

    public function test_returns_default_for_empty_text(): void
    {
        $result = $this->service->detect('');

        $this->assertEquals('en', $result->language);
        $this->assertEquals(0.0, $result->confidence);
        $this->assertFalse($result->isReliable);
    }

    public function test_returns_default_for_whitespace_only(): void
    {
        $result = $this->service->detect('   ');

        $this->assertEquals('en', $result->language);
        $this->assertFalse($result->isReliable);
    }

    public function test_handles_very_short_text(): void
    {
        $result = $this->service->detect('Hi');

        // Very short text may not be reliable
        $this->assertIsString($result->language);
    }

    public function test_handles_numbers_only(): void
    {
        $result = $this->service->detect('12345');

        $this->assertEquals('en', $result->language);
        $this->assertFalse($result->isReliable);
    }

    public function test_handles_mixed_content(): void
    {
        // Text with multiple languages should detect the dominant one
        $text = 'Great restaurant! Merci beaucoup!';

        $result = $this->service->detect($text);

        // Should return one of the languages
        $this->assertContains($result->language, ['en', 'fr']);
    }

    public function test_handles_text_with_emojis(): void
    {
        $text = 'Amazing food! 🍕🍝 Great service! ⭐⭐⭐⭐⭐';

        $result = $this->service->detect($text);

        $this->assertEquals('en', $result->language);
    }

    public function test_handles_text_with_special_characters(): void
    {
        $text = 'Thank you!!! @restaurant #amazing ***great***';

        $result = $this->service->detect($text);

        $this->assertEquals('en', $result->language);
    }

    // ========================================
    // detectLanguageCode() Tests
    // ========================================

    public function test_detect_language_code_returns_string(): void
    {
        $code = $this->service->detectLanguageCode('Thank you for the great service');

        $this->assertIsString($code);
        $this->assertEquals('en', $code);
    }

    public function test_detect_language_code_for_french(): void
    {
        $code = $this->service->detectLanguageCode('Merci beaucoup pour le service');

        $this->assertEquals('fr', $code);
    }

    // ========================================
    // Confidence and Reliability Tests
    // ========================================

    public function test_reliability_is_better_for_longer_texts(): void
    {
        // Very short ambiguous text
        $shortText = 'ok';
        // Clear longer text with many characteristic words
        $longText = 'Thank you very much for the excellent service. The food was delicious and the staff was incredibly friendly. We had a wonderful experience and will definitely come back again.';

        $shortResult = $this->service->detect($shortText);
        $longResult = $this->service->detect($longText);

        // Longer text should be more reliably detected
        $this->assertTrue($longResult->isReliable);
        // Short ambiguous text may or may not be reliable
        $this->assertIsBool($shortResult->isReliable);
    }

    public function test_result_contains_all_scores(): void
    {
        $result = $this->service->detect('Thank you for the great service');

        // For Latin-based detection, allScores should contain scores for each language
        $this->assertIsArray($result->allScores);
    }

    // ========================================
    // LanguageDetectionResult Tests
    // ========================================

    public function test_result_to_array(): void
    {
        $result = $this->service->detect('Thank you');
        $array = $result->toArray();

        $this->assertArrayHasKey('language', $array);
        $this->assertArrayHasKey('confidence', $array);
        $this->assertArrayHasKey('is_reliable', $array);
        $this->assertArrayHasKey('language_name', $array);
    }

    public function test_result_get_language_name(): void
    {
        $result = $this->service->detect('Thank you very much for the service');

        $this->assertEquals('English', $result->getLanguageName());
    }

    public function test_result_is_method(): void
    {
        $result = $this->service->detect('Merci beaucoup pour le service');

        $this->assertTrue($result->is('fr'));
        $this->assertFalse($result->is('en'));
    }

    public function test_result_is_one_of_method(): void
    {
        $result = $this->service->detect('Merci beaucoup pour le service');

        $this->assertTrue($result->isOneOf(['fr', 'en', 'es']));
        $this->assertFalse($result->isOneOf(['de', 'it']));
    }

    // ========================================
    // Supported Languages Tests
    // ========================================

    public function test_supported_languages_constant(): void
    {
        $supported = LanguageDetectorService::SUPPORTED_LANGUAGES;

        $this->assertContains('en', $supported);
        $this->assertContains('fr', $supported);
        $this->assertContains('es', $supported);
        $this->assertContains('de', $supported);
        $this->assertContains('it', $supported);
        $this->assertContains('pt', $supported);
        $this->assertContains('nl', $supported);
        $this->assertContains('ja', $supported);
        $this->assertContains('zh', $supported);
        $this->assertContains('ko', $supported);
        $this->assertContains('ar', $supported);
        $this->assertContains('ru', $supported);
    }
}
