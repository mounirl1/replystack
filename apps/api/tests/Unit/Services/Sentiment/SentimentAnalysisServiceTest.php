<?php

namespace Tests\Unit\Services\Sentiment;

use App\Models\Review;
use App\Services\AI\GeminiService;
use App\Services\Sentiment\SentimentAnalysisService;
use App\Services\Sentiment\SentimentResult;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class SentimentAnalysisServiceTest extends TestCase
{
    private SentimentAnalysisService $service;
    private MockInterface $geminiMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->geminiMock = Mockery::mock(GeminiService::class);
        $this->service = new SentimentAnalysisService($this->geminiMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ========================================
    // analyzeFromRating() Tests
    // ========================================

    /**
     * @dataProvider ratingScoreProvider
     */
    public function test_analyze_from_rating_returns_correct_score(int $rating, float $expectedScore): void
    {
        $result = $this->service->analyzeFromRating($rating);

        $this->assertInstanceOf(SentimentResult::class, $result);
        $this->assertEquals($expectedScore, $result->score);
        $this->assertEmpty($result->themes);
    }

    public static function ratingScoreProvider(): array
    {
        return [
            '1 star rating' => [1, 0.1],
            '2 star rating' => [2, 0.3],
            '3 star rating' => [3, 0.5],
            '4 star rating' => [4, 0.7],
            '5 star rating' => [5, 0.9],
        ];
    }

    public function test_analyze_from_rating_handles_null_rating(): void
    {
        $result = $this->service->analyzeFromRating(null);

        $this->assertEquals(0.5, $result->score);
        $this->assertEquals('neutral', $result->label);
    }

    // ========================================
    // getLabelFromScore() Tests
    // ========================================

    /**
     * @dataProvider scoreLabelProvider
     */
    public function test_get_label_from_score_returns_correct_label(float $score, string $expectedLabel): void
    {
        $label = $this->service->getLabelFromScore($score);

        $this->assertEquals($expectedLabel, $label);
    }

    public static function scoreLabelProvider(): array
    {
        return [
            'very negative (0.0)' => [0.0, 'negative'],
            'negative (0.2)' => [0.2, 'negative'],
            'negative boundary (0.39)' => [0.39, 'negative'],
            'neutral lower boundary (0.4)' => [0.4, 'neutral'],
            'neutral middle (0.5)' => [0.5, 'neutral'],
            'neutral upper boundary (0.59)' => [0.59, 'neutral'],
            'positive lower boundary (0.6)' => [0.6, 'positive'],
            'positive (0.8)' => [0.8, 'positive'],
            'very positive (1.0)' => [1.0, 'positive'],
        ];
    }

    // ========================================
    // analyze() Tests - Empty Content
    // ========================================

    public function test_analyze_uses_rating_when_content_is_empty(): void
    {
        $review = new Review();
        $review->content = '';
        $review->rating = 5;

        // Gemini should NOT be called for empty content
        $this->geminiMock->shouldNotReceive('generateCompletion');

        $result = $this->service->analyze($review);

        $this->assertEquals(0.9, $result->score);
        $this->assertEquals('positive', $result->label);
    }

    public function test_analyze_uses_rating_when_content_is_null(): void
    {
        $review = new Review();
        $review->content = null;
        $review->rating = 1;

        $this->geminiMock->shouldNotReceive('generateCompletion');

        $result = $this->service->analyze($review);

        $this->assertEquals(0.1, $result->score);
        $this->assertEquals('negative', $result->label);
    }

    // ========================================
    // analyze() Tests - With AI
    // ========================================

    public function test_analyze_calls_gemini_when_content_exists(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Great service and friendly staff!';
        $review->rating = 5;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": 0.85, "themes": ["service", "welcome"]}',
            ]);

        $result = $this->service->analyze($review);

        $this->assertEquals(0.85, $result->score);
        $this->assertEquals('positive', $result->label);
        $this->assertEquals(['service', 'welcome'], $result->themes);
    }

    public function test_analyze_handles_json_in_markdown_code_block(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'The food was delicious!';
        $review->rating = 5;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '```json
{"score": 0.9, "themes": ["quality"]}
```',
            ]);

        $result = $this->service->analyze($review);

        $this->assertEquals(0.9, $result->score);
        $this->assertEquals(['quality'], $result->themes);
    }

    public function test_analyze_clamps_score_between_0_and_1(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Some review';
        $review->rating = 5;

        // Test score > 1
        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": 1.5, "themes": []}',
            ]);

        $result = $this->service->analyze($review);
        $this->assertEquals(1.0, $result->score);
    }

    public function test_analyze_clamps_negative_score_to_zero(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Some review';
        $review->rating = 1;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": -0.5, "themes": []}',
            ]);

        $result = $this->service->analyze($review);
        $this->assertEquals(0.0, $result->score);
    }

    public function test_analyze_filters_invalid_themes(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Some review';
        $review->rating = 4;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": 0.7, "themes": ["service", "invalid_theme", "quality", "fake"]}',
            ]);

        $result = $this->service->analyze($review);

        $this->assertEquals(['service', 'quality'], $result->themes);
        $this->assertNotContains('invalid_theme', $result->themes);
        $this->assertNotContains('fake', $result->themes);
    }

    // ========================================
    // analyze() Tests - Fallback Behavior
    // ========================================

    public function test_analyze_falls_back_to_rating_on_ai_failure(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Great service!';
        $review->rating = 4;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andThrow(new \Exception('API Error'));

        $result = $this->service->analyze($review);

        // Should fall back to rating-based analysis
        $this->assertEquals(0.7, $result->score);
        $this->assertEquals('positive', $result->label);
        $this->assertEmpty($result->themes);
    }

    public function test_analyze_falls_back_to_rating_on_invalid_json(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Great service!';
        $review->rating = 5;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => 'This is not valid JSON at all',
            ]);

        $result = $this->service->analyze($review);

        $this->assertEquals(0.9, $result->score);
        $this->assertEmpty($result->themes);
    }

    public function test_analyze_falls_back_when_json_missing_score(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = 'Great service!';
        $review->rating = 3;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"themes": ["service"]}',
            ]);

        $result = $this->service->analyze($review);

        // Falls back to rating-based because no score
        $this->assertEquals(0.5, $result->score);
    }

    // ========================================
    // Edge Cases
    // ========================================

    public function test_analyze_handles_very_long_content(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = str_repeat('Great service! ', 500); // Very long content
        $review->rating = 5;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": 0.8, "themes": ["service"]}',
            ]);

        $result = $this->service->analyze($review);

        $this->assertInstanceOf(SentimentResult::class, $result);
    }

    public function test_analyze_handles_special_characters_in_content(): void
    {
        $review = new Review();
        $review->id = 1;
        $review->content = "Great service! 🎉 \"Best place ever\" <script>alert('xss')</script>";
        $review->rating = 5;

        $this->geminiMock
            ->shouldReceive('generateCompletion')
            ->once()
            ->andReturn([
                'content' => '{"score": 0.9, "themes": ["service"]}',
            ]);

        $result = $this->service->analyze($review);

        $this->assertInstanceOf(SentimentResult::class, $result);
    }
}
