<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewControllerTest extends TestCase
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
    }

    /**
     * Test can list reviews with filters.
     */
    public function test_can_list_reviews_with_filters(): void
    {
        // Create reviews
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'status' => 'pending',
            'rating' => 4,
        ]);

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
            'status' => 'replied',
            'rating' => 2,
        ]);

        // Test basic list
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'platform',
                        'external_id',
                        'author_name',
                        'rating',
                        'content',
                        'status',
                        'location',
                    ],
                ],
                'meta',
                'links',
            ]);

        $this->assertCount(8, $response->json('data'));

        // Test filter by platform
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews?platform[]=google');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));

        // Test filter by status
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews?status[]=replied');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        // Test filter by rating
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews?rating_min=3');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test can get review stats.
     */
    public function test_can_get_review_stats(): void
    {
        Review::factory()->count(5)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'status' => 'pending',
            'rating' => 5,
            'published_at' => now()->subDays(5),
        ]);

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
            'status' => 'replied',
            'rating' => 3,
            'published_at' => now()->subDays(10),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total',
                'pending',
                'replied',
                'ignored',
                'average_rating',
                'response_rate',
                'by_platform',
                'by_rating',
                'trend',
            ])
            ->assertJson([
                'total' => 8,
                'pending' => 5,
                'replied' => 3,
                'ignored' => 0,
            ]);

        // Verify average rating is a number between 1 and 5
        $averageRating = $response->json('average_rating');
        $this->assertNotNull($averageRating);
        $this->assertGreaterThanOrEqual(1, $averageRating);
        $this->assertLessThanOrEqual(5, $averageRating);

        // Verify response rate: 3/8 * 100 = 37.5%
        $this->assertEquals(37.5, $response->json('response_rate'));
    }

    /**
     * Test can update review status.
     */
    public function test_can_update_review_status(): void
    {
        $review = Review::factory()->create([
            'location_id' => $this->location->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->patchJson("/api/reviews/{$review->id}/status", [
                'status' => 'replied',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'review' => [
                    'id' => $review->id,
                    'status' => 'replied',
                ],
            ]);

        $review->refresh();
        $this->assertEquals('replied', $review->status);
        $this->assertNotNull($review->replied_at);
    }

    /**
     * Test cannot access other users reviews.
     */
    public function test_cannot_access_other_users_reviews(): void
    {
        $otherUser = User::factory()->create();
        $otherLocation = Location::factory()->create([
            'user_id' => $otherUser->id,
        ]);
        $otherReview = Review::factory()->create([
            'location_id' => $otherLocation->id,
        ]);

        // Try to view
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/reviews/{$otherReview->id}");

        $response->assertStatus(403);

        // Try to update status
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->patchJson("/api/reviews/{$otherReview->id}/status", [
                'status' => 'replied',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test sync creates and updates reviews.
     */
    public function test_sync_creates_and_updates_reviews(): void
    {
        // Initial sync
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reviews/sync', [
                'location_id' => $this->location->id,
                'platform' => 'google',
                'reviews' => [
                    [
                        'external_id' => 'review-1',
                        'author_name' => 'John Doe',
                        'rating' => 5,
                        'content' => 'Great experience!',
                        'published_at' => now()->toIso8601String(),
                        'has_response' => false,
                    ],
                    [
                        'external_id' => 'review-2',
                        'author_name' => 'Jane Smith',
                        'rating' => 3,
                        'content' => 'It was okay.',
                        'published_at' => now()->subDay()->toIso8601String(),
                        'has_response' => true,
                    ],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'created' => 2,
                'updated' => 0,
                'unchanged' => 0,
            ]);

        $this->assertDatabaseHas('reviews', [
            'location_id' => $this->location->id,
            'platform' => 'google',
            'external_id' => 'review-1',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('reviews', [
            'location_id' => $this->location->id,
            'platform' => 'google',
            'external_id' => 'review-2',
            'status' => 'replied',
        ]);

        // Sync again with updates
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reviews/sync', [
                'location_id' => $this->location->id,
                'platform' => 'google',
                'reviews' => [
                    [
                        'external_id' => 'review-1',
                        'author_name' => 'John Doe',
                        'rating' => 5,
                        'content' => 'Updated: Great experience!',
                        'published_at' => now()->toIso8601String(),
                        'has_response' => false,
                    ],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'created' => 0,
                'updated' => 1,
                'unchanged' => 0,
            ]);
    }

    /**
     * Test sync fails for other users location.
     */
    public function test_sync_fails_for_other_users_location(): void
    {
        $otherUser = User::factory()->create();
        $otherLocation = Location::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reviews/sync', [
                'location_id' => $otherLocation->id,
                'platform' => 'google',
                'reviews' => [
                    [
                        'external_id' => 'review-1',
                        'author_name' => 'John Doe',
                        'rating' => 5,
                        'content' => 'Great!',
                        'published_at' => now()->toIso8601String(),
                    ],
                ],
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test can search reviews by content.
     */
    public function test_can_search_reviews_by_content(): void
    {
        Review::factory()->create([
            'location_id' => $this->location->id,
            'content' => 'The food was excellent and service was great!',
        ]);

        Review::factory()->create([
            'location_id' => $this->location->id,
            'content' => 'Not impressed with the atmosphere.',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/reviews?search=excellent');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertStringContainsString('excellent', $response->json('data.0.content'));
    }

    /**
     * Test get extraction tasks for extension.
     */
    public function test_get_extraction_tasks(): void
    {
        // Create location with platform IDs but no API connection
        $this->location->update([
            'tripadvisor_id' => 'trip-123',
            'tripadvisor_management_url' => 'https://tripadvisor.com/manage/123',
            'booking_id' => 'book-456',
            'auto_fetch_enabled' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/locations/extraction-tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tasks' => [
                    '*' => [
                        'location_id',
                        'location_name',
                        'platforms' => [
                            '*' => [
                                'platform',
                                'platform_id',
                                'management_url',
                                'last_fetched_at',
                            ],
                        ],
                    ],
                ],
            ]);

        $tasks = $response->json('tasks');
        $this->assertNotEmpty($tasks);
        $this->assertEquals($this->location->id, $tasks[0]['location_id']);
    }

    /**
     * Test trigger fetch requires API connection.
     */
    public function test_trigger_fetch_requires_api_connection(): void
    {
        // Location without API connection
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reviews/fetch', [
                'location_id' => $this->location->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Aucune connexion API valide pour cet établissement.',
            ]);
    }

    /**
     * Test review show returns full details.
     */
    public function test_review_show_returns_full_details(): void
    {
        $review = Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'platform',
                    'external_id',
                    'author_name',
                    'rating',
                    'content',
                    'content_excerpt',
                    'time_ago',
                    'status',
                    'location',
                    'can_publish_via_api',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $review->id,
                    'platform' => 'google',
                    'can_publish_via_api' => true,
                ],
            ]);
    }
}
