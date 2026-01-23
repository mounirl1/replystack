<?php

namespace Tests\Unit\Services\AI;

use App\Models\User;
use App\Services\AI\AIProviderFactory;
use App\Services\AI\Contracts\AIProviderContract;
use App\Services\AI\ReplyGeneratorService;
use App\Services\Language\LanguageDetectorService;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class ReplyGeneratorServiceTest extends TestCase
{
    private ReplyGeneratorService $service;
    private MockInterface $factoryMock;
    private MockInterface $providerMock;
    private MockInterface $languageDetectorMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->factoryMock = Mockery::mock(AIProviderFactory::class);
        $this->providerMock = Mockery::mock(AIProviderContract::class);
        $this->languageDetectorMock = Mockery::mock(LanguageDetectorService::class);
        $this->service = new ReplyGeneratorService($this->factoryMock, $this->languageDetectorMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ========================================
    // validateReviewData() Tests
    // ========================================

    public function test_validate_review_data_passes_for_valid_review(): void
    {
        $review = [
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertEmpty($errors);
    }

    public function test_validate_review_data_allows_empty_content(): void
    {
        $review = [
            'content' => '',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertEmpty($errors);
    }

    public function test_validate_review_data_fails_for_invalid_rating(): void
    {
        $review = [
            'content' => 'Great!',
            'rating' => 6,
            'author' => 'John',
            'platform' => 'google',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Rating must be between 1 and 5', $errors[0]);
    }

    public function test_validate_review_data_fails_for_zero_rating(): void
    {
        $review = [
            'content' => 'Great!',
            'rating' => 0,
            'author' => 'John',
            'platform' => 'google',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertNotEmpty($errors);
    }

    public function test_validate_review_data_fails_for_missing_rating(): void
    {
        $review = [
            'content' => 'Great!',
            'author' => 'John',
            'platform' => 'google',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertNotEmpty($errors);
    }

    public function test_validate_review_data_fails_for_invalid_platform(): void
    {
        $review = [
            'content' => 'Great!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'invalid_platform',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Valid platform is required', $errors[0]);
    }

    public function test_validate_review_data_fails_for_missing_platform(): void
    {
        $review = [
            'content' => 'Great!',
            'rating' => 5,
            'author' => 'John',
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertNotEmpty($errors);
    }

    /**
     * @dataProvider validPlatformsProvider
     */
    public function test_validate_review_data_accepts_valid_platforms(string $platform): void
    {
        $review = [
            'content' => 'Great!',
            'rating' => 5,
            'author' => 'John',
            'platform' => $platform,
        ];

        $errors = $this->service->validateReviewData($review);

        $this->assertEmpty($errors, "Platform '$platform' should be valid");
    }

    public static function validPlatformsProvider(): array
    {
        return [
            ['google'],
            ['tripadvisor'],
            ['booking'],
            ['yelp'],
            ['facebook'],
            ['g2'],
            ['capterra'],
            ['trustpilot'],
        ];
    }

    // ========================================
    // validateOptions() Tests
    // ========================================

    public function test_validate_options_passes_for_valid_options(): void
    {
        $options = [
            'tone' => 'professional',
            'length' => 'medium',
        ];

        $errors = $this->service->validateOptions($options);

        $this->assertEmpty($errors);
    }

    public function test_validate_options_passes_for_empty_options(): void
    {
        $errors = $this->service->validateOptions([]);

        $this->assertEmpty($errors);
    }

    public function test_validate_options_fails_for_invalid_tone(): void
    {
        $options = [
            'tone' => 'invalid_tone',
        ];

        $errors = $this->service->validateOptions($options);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Invalid tone', $errors[0]);
    }

    public function test_validate_options_fails_for_invalid_length(): void
    {
        $options = [
            'length' => 'super_long',
        ];

        $errors = $this->service->validateOptions($options);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Invalid length', $errors[0]);
    }

    /**
     * @dataProvider validTonesProvider
     */
    public function test_validate_options_accepts_valid_tones(string $tone): void
    {
        $options = ['tone' => $tone];

        $errors = $this->service->validateOptions($options);

        $this->assertEmpty($errors, "Tone '$tone' should be valid");
    }

    public static function validTonesProvider(): array
    {
        return [
            ['professional'],
            ['friendly'],
            ['formal'],
            ['casual'],
            ['warm'],
            ['luxury'],
            ['dynamic'],
        ];
    }

    // ========================================
    // generate() Tests
    // ========================================

    public function test_generate_returns_correct_structure(): void
    {
        $review = [
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Thank you for your wonderful review!',
                'tokens_used' => 50,
                'generation_time_ms' => 200,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->once()
            ->andReturn('gemini');

        $this->factoryMock
            ->shouldReceive('make')
            ->once()
            ->andReturn($this->providerMock);

        $this->languageDetectorMock
            ->shouldReceive('detectLanguageCode')
            ->with('Great service!')
            ->once()
            ->andReturn('en');

        $result = $this->service->generate($review, ['tone' => 'professional']);

        $this->assertArrayHasKey('reply', $result);
        $this->assertArrayHasKey('tone', $result);
        $this->assertArrayHasKey('language', $result);
        $this->assertArrayHasKey('length', $result);
        $this->assertArrayHasKey('tokens_used', $result);
        $this->assertArrayHasKey('generation_time_ms', $result);
        $this->assertArrayHasKey('provider', $result);

        $this->assertEquals('Thank you for your wonderful review!', $result['reply']);
        $this->assertEquals('professional', $result['tone']);
        $this->assertEquals('gemini', $result['provider']);
    }

    public function test_generate_uses_factory_for_user_when_provided(): void
    {
        $review = [
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $user = new User();
        $user->id = 1;
        $user->plan = 'pro';

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Reply',
                'tokens_used' => 30,
                'generation_time_ms' => 100,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->once()
            ->andReturn('mistral');

        $this->factoryMock
            ->shouldReceive('forUser')
            ->with($user)
            ->once()
            ->andReturn($this->providerMock);

        $this->languageDetectorMock
            ->shouldReceive('detectLanguageCode')
            ->with('Great service!')
            ->once()
            ->andReturn('en');

        $result = $this->service->generate($review, [], $user);

        $this->assertEquals('mistral', $result['provider']);
    }

    public function test_generate_uses_default_tone_when_not_specified(): void
    {
        $review = [
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Reply',
                'tokens_used' => 30,
                'generation_time_ms' => 100,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->andReturn('gemini');

        $this->factoryMock
            ->shouldReceive('make')
            ->andReturn($this->providerMock);

        $this->languageDetectorMock
            ->shouldReceive('detectLanguageCode')
            ->with('Great service!')
            ->once()
            ->andReturn('en');

        $result = $this->service->generate($review);

        $this->assertEquals('professional', $result['tone']);
    }

    public function test_generate_uses_default_length_when_not_specified(): void
    {
        $review = [
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ];

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Reply',
                'tokens_used' => 30,
                'generation_time_ms' => 100,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->andReturn('gemini');

        $this->factoryMock
            ->shouldReceive('make')
            ->andReturn($this->providerMock);

        $this->languageDetectorMock
            ->shouldReceive('detectLanguageCode')
            ->with('Great service!')
            ->once()
            ->andReturn('en');

        $result = $this->service->generate($review);

        $this->assertEquals('medium', $result['length']);
    }

    // ========================================
    // Language Detection Tests
    // ========================================

    /**
     * @dataProvider languageDetectionProvider
     */
    public function test_generate_detects_language_correctly(string $content, string $expectedLanguage): void
    {
        $review = [
            'content' => $content,
            'rating' => 5,
            'author' => 'Test',
            'platform' => 'google',
        ];

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Reply',
                'tokens_used' => 30,
                'generation_time_ms' => 100,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->andReturn('gemini');

        $this->factoryMock
            ->shouldReceive('make')
            ->andReturn($this->providerMock);

        $this->languageDetectorMock
            ->shouldReceive('detectLanguageCode')
            ->with($content)
            ->once()
            ->andReturn($expectedLanguage);

        $result = $this->service->generate($review, ['language' => 'auto']);

        $this->assertEquals($expectedLanguage, $result['language']);
    }

    public static function languageDetectionProvider(): array
    {
        return [
            'French text' => ['Merci beaucoup pour le service, nous avons très bien mangé', 'fr'],
            'English text' => ['Thank you very much for the great service, the food was delicious', 'en'],
            'Spanish text' => ['Muchas gracias por el servicio, la comida estaba muy buena', 'es'],
            'German text' => ['Vielen Dank für den sehr guten Service und das leckere Essen', 'de'],
            'Italian text' => ['Grazie mille per il servizio, il cibo era molto buono', 'it'],
        ];
    }

    public function test_generate_uses_specified_language_when_not_auto(): void
    {
        $review = [
            'content' => 'Merci beaucoup!',
            'rating' => 5,
            'author' => 'Test',
            'platform' => 'google',
        ];

        $this->providerMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'Reply',
                'tokens_used' => 30,
                'generation_time_ms' => 100,
            ]);

        $this->providerMock
            ->shouldReceive('getProviderName')
            ->andReturn('gemini');

        $this->factoryMock
            ->shouldReceive('make')
            ->andReturn($this->providerMock);

        // Language detector should NOT be called when language is specified
        $this->languageDetectorMock
            ->shouldNotReceive('detectLanguageCode');

        $result = $this->service->generate($review, ['language' => 'en']);

        // Should use specified language, not detected
        $this->assertEquals('en', $result['language']);
    }

    // ========================================
    // Constants Tests
    // ========================================

    public function test_tones_constant_contains_expected_values(): void
    {
        $this->assertContains('professional', ReplyGeneratorService::TONES);
        $this->assertContains('friendly', ReplyGeneratorService::TONES);
        $this->assertContains('formal', ReplyGeneratorService::TONES);
        $this->assertContains('casual', ReplyGeneratorService::TONES);
    }

    public function test_platforms_constant_contains_expected_values(): void
    {
        $this->assertContains('google', ReplyGeneratorService::PLATFORMS);
        $this->assertContains('tripadvisor', ReplyGeneratorService::PLATFORMS);
        $this->assertContains('booking', ReplyGeneratorService::PLATFORMS);
        $this->assertContains('yelp', ReplyGeneratorService::PLATFORMS);
        $this->assertContains('facebook', ReplyGeneratorService::PLATFORMS);
    }
}
