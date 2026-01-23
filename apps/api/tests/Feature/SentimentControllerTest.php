<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SentimentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Location $location;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->location = Location::factory()->create([
            'user_id' => $this->user->id,
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;

        // Clear cache before each test
        Cache::flush();
    }

    /**
     * Test can get sentiment summary.
     */
    public function test_can_get_sentiment_summary(): void
    {
        // Create reviews with sentiment analysis
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_themes' => ['service', 'quality'],
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'sentiment_score' => 0.5,
            'sentiment_label' => 'neutral',
            'sentiment_themes' => ['price'],
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
            'sentiment_score' => 0.2,
            'sentiment_label' => 'negative',
            'sentiment_themes' => ['cleanliness', 'service'],
            'sentiment_analyzed_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_analyzed',
                'average_score',
                'distribution' => [
                    'positive',
                    'neutral',
                    'negative',
                ],
                'distribution_percentages' => [
                    'positive',
                    'neutral',
                    'negative',
                ],
                'score_change',
                'period',
            ])
            ->assertJson([
                'total_analyzed' => 10,
                'distribution' => [
                    'positive' => 5,
                    'neutral' => 2,
                    'negative' => 3,
                ],
            ]);

        // Verify percentages
        $this->assertEquals(50.0, $response->json('distribution_percentages.positive'));
        $this->assertEquals(20.0, $response->json('distribution_percentages.neutral'));
        $this->assertEquals(30.0, $response->json('distribution_percentages.negative'));
    }

    /**
     * Test sentiment summary with filters.
     */
    public function test_sentiment_summary_with_filters(): void
    {
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
            'published_at' => now()->subDays(5),
        ]);

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
            'sentiment_score' => 0.3,
            'sentiment_label' => 'negative',
            'sentiment_analyzed_at' => now(),
            'published_at' => now()->subDays(5),
        ]);

        // Filter by platform
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary?platform[]=google');

        $response->assertStatus(200)
            ->assertJson([
                'total_analyzed' => 5,
                'distribution' => [
                    'positive' => 5,
                    'neutral' => 0,
                    'negative' => 0,
                ],
            ]);

        // Filter by date range
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary?date_from=' . now()->subDays(10)->toDateString() . '&date_to=' . now()->toDateString());

        $response->assertStatus(200)
            ->assertJson([
                'total_analyzed' => 8,
            ]);
    }

    /**
     * Test sentiment summary returns empty when no analyzed reviews.
     */
    public function test_sentiment_summary_empty_when_no_analyzed_reviews(): void
    {
        // Create reviews WITHOUT sentiment analysis
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'sentiment_analyzed_at' => null,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response->assertStatus(200)
            ->assertJson([
                'total_analyzed' => 0,
                'average_score' => null,
                'distribution' => [
                    'positive' => 0,
                    'neutral' => 0,
                    'negative' => 0,
                ],
            ]);
    }

    /**
     * Test can get sentiment trends.
     */
    public function test_can_get_sentiment_trends(): void
    {
        // Create reviews on different days
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.9,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
            'published_at' => now()->subDays(2),
        ]);

        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.3,
            'sentiment_label' => 'negative',
            'sentiment_analyzed_at' => now(),
            'published_at' => now()->subDays(1),
        ]);

        Review::factory()->count(4)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.7,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
            'published_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/trends');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'granularity',
                'data' => [
                    '*' => [
                        'period',
                        'avg_score',
                        'count',
                        'distribution' => [
                            'positive',
                            'neutral',
                            'negative',
                        ],
                    ],
                ],
                'period',
            ])
            ->assertJson([
                'granularity' => 'day',
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
    }

    /**
     * Test sentiment trends with different granularities.
     */
    public function test_sentiment_trends_with_granularity(): void
    {
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
            'published_at' => now()->subDays(5),
        ]);

        // Test week granularity
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/trends?granularity=week');

        $response->assertStatus(200)
            ->assertJson([
                'granularity' => 'week',
            ]);

        // Test month granularity
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/trends?granularity=month');

        $response->assertStatus(200)
            ->assertJson([
                'granularity' => 'month',
            ]);
    }

    /**
     * Test can get sentiment themes.
     */
    public function test_can_get_sentiment_themes(): void
    {
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_themes' => ['service', 'quality'],
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.3,
            'sentiment_label' => 'negative',
            'sentiment_themes' => ['service', 'cleanliness'],
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(1)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.5,
            'sentiment_label' => 'neutral',
            'sentiment_themes' => ['price'],
            'sentiment_analyzed_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/themes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'themes' => [
                    '*' => [
                        'theme',
                        'count',
                        'avg_score',
                        'sentiment_breakdown' => [
                            'positive',
                            'neutral',
                            'negative',
                        ],
                    ],
                ],
                'total_reviews',
                'period',
            ]);

        $themes = $response->json('themes');

        // Service should be most frequent (5 mentions)
        $this->assertEquals('service', $themes[0]['theme']);
        $this->assertEquals(5, $themes[0]['count']);

        // Verify service breakdown: 3 positive, 2 negative
        $this->assertEquals(3, $themes[0]['sentiment_breakdown']['positive']);
        $this->assertEquals(2, $themes[0]['sentiment_breakdown']['negative']);
    }

    /**
     * Test themes filtered by sentiment.
     */
    public function test_themes_filtered_by_sentiment(): void
    {
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_themes' => ['service', 'quality'],
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.2,
            'sentiment_label' => 'negative',
            'sentiment_themes' => ['cleanliness'],
            'sentiment_analyzed_at' => now(),
        ]);

        // Filter by positive sentiment
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/themes?sentiment=positive');

        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('total_reviews'));

        $themes = $response->json('themes');
        // Should only have service and quality
        $themeNames = array_column($themes, 'theme');
        $this->assertContains('service', $themeNames);
        $this->assertContains('quality', $themeNames);
        $this->assertNotContains('cleanliness', $themeNames);
    }

    /**
     * Test cannot access other users sentiment data.
     */
    public function test_cannot_access_other_users_sentiment_data(): void
    {
        $otherUser = User::factory()->create();
        $otherLocation = Location::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        Review::factory()->count(5)->create([
            'location_id' => $otherLocation->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
        ]);

        // Try to filter by other user's location
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary?location_id=' . $otherLocation->id);

        $response->assertStatus(403);
    }

    /**
     * Test sentiment endpoints require authentication.
     */
    public function test_sentiment_endpoints_require_authentication(): void
    {
        $response = $this->getJson('/api/reviews/sentiment/summary');
        $response->assertStatus(401);

        $response = $this->getJson('/api/reviews/sentiment/trends');
        $response->assertStatus(401);

        $response = $this->getJson('/api/reviews/sentiment/themes');
        $response->assertStatus(401);
    }

    /**
     * Test sentiment summary is cached.
     */
    public function test_sentiment_summary_is_cached(): void
    {
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
        ]);

        // First request
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response1->assertStatus(200)
            ->assertJson(['total_analyzed' => 5]);

        // Add more reviews (but cache should still return old data)
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.3,
            'sentiment_label' => 'negative',
            'sentiment_analyzed_at' => now(),
        ]);

        // Second request should return cached data
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response2->assertStatus(200)
            ->assertJson(['total_analyzed' => 5]); // Still 5, not 8

        // Clear cache and verify new data
        Cache::flush();

        $response3 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response3->assertStatus(200)
            ->assertJson(['total_analyzed' => 8]); // Now 8
    }

    /**
     * Test sentiment summary with location filter.
     */
    public function test_sentiment_summary_with_location_filter(): void
    {
        $location2 = Location::factory()->create([
            'user_id' => $this->user->id,
        ]);

        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'sentiment_score' => 0.8,
            'sentiment_label' => 'positive',
            'sentiment_analyzed_at' => now(),
        ]);

        Review::factory()->count(3)->create([
            'location_id' => $location2->id,
            'sentiment_score' => 0.3,
            'sentiment_label' => 'negative',
            'sentiment_analyzed_at' => now(),
        ]);

        // Without filter - should see all
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary');

        $response->assertStatus(200)
            ->assertJson(['total_analyzed' => 8]);

        // With filter - should see only location 1
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/summary?location_id=' . $this->location->id);

        $response->assertStatus(200)
            ->assertJson([
                'total_analyzed' => 5,
                'distribution' => [
                    'positive' => 5,
                    'neutral' => 0,
                    'negative' => 0,
                ],
            ]);
    }

    /**
     * Test invalid granularity parameter returns validation error.
     */
    public function test_invalid_granularity_returns_validation_error(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/trends?granularity=invalid');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['granularity']);
    }

    /**
     * Test invalid sentiment filter returns validation error.
     */
    public function test_invalid_sentiment_filter_returns_validation_error(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/sentiment/themes?sentiment=invalid');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sentiment']);
    }
}
