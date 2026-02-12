<?php

namespace Tests\Feature\TriggerFlow;

use App\Models\Location;
use App\Models\Review;
use App\Models\ReviewConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TriggerFlowApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.triggerflow.api_url' => 'https://triggerflow.test']);
        config(['services.triggerflow.api_key' => 'test-api-key']);

        // Clear cache to avoid stale token validations between tests
        Cache::flush();
    }

    /**
     * Build authenticated headers by faking a successful TriggerFlow API response.
     * Returns an array of headers to use with requests.
     */
    protected function authenticatedHeaders(): array
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'tf@test.com',
                'name' => 'TF User',
                'plan' => 'pro',
            ]),
        ]);

        return ['Authorization' => 'Bearer valid-tf-token'];
    }

    /**
     * Get the user created by the TriggerFlow auth middleware.
     */
    protected function getTriggerFlowUser(): User
    {
        return User::where('email', 'tf@test.com')->firstOrFail();
    }

    /**
     * Create a location owned by the TriggerFlow user.
     */
    protected function createTriggerFlowLocation(array $attributes = []): Location
    {
        // Ensure the TF user exists first
        $user = User::where('email', 'tf@test.com')->first();
        if (!$user) {
            $user = User::factory()->create([
                'email' => 'tf@test.com',
                'name' => 'TF User',
                'plan' => 'pro',
                'monthly_quota' => 200,
                'external_user_id' => '1',
                'external_source' => 'triggerflow',
            ]);
        }

        return Location::factory()->create(array_merge([
            'user_id' => $user->id,
            'external_facility_id' => 'ext-123',
            'external_source' => 'triggerflow',
        ], $attributes));
    }

    // =========================================================================
    // Authentication Tests
    // =========================================================================

    /**
     * Test that requests without a bearer token are rejected with 401.
     */
    public function test_rejects_request_without_token(): void
    {
        Http::fake();

        $response = $this->postJson('/api/triggerflow/locations/sync', [
            'external_id' => 'ext-123',
            'name' => 'Test Location',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Authorization token required']);
    }

    /**
     * Test that requests with an invalid token are rejected with 401.
     */
    public function test_rejects_invalid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response(['message' => 'Unauthenticated'], 401),
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer invalid-token'])
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'ext-123',
                'name' => 'Test Location',
            ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid or expired token']);
    }

    // =========================================================================
    // Location Sync Tests
    // =========================================================================

    /**
     * Test syncing a new location creates it in the database.
     */
    public function test_sync_location_creates_new(): void
    {
        $headers = $this->authenticatedHeaders();

        $response = $this->withHeaders($headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'ext-new-456',
                'name' => 'New Restaurant',
                'address' => '123 Main Street',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Location synced successfully']);

        $this->assertDatabaseHas('locations', [
            'external_facility_id' => 'ext-new-456',
            'external_source' => 'triggerflow',
            'name' => 'New Restaurant',
            'address' => '123 Main Street',
        ]);
    }

    /**
     * Test syncing an existing location updates it instead of creating a duplicate.
     */
    public function test_sync_location_updates_existing(): void
    {
        $headers = $this->authenticatedHeaders();

        // First create the location via sync
        $this->withHeaders($headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'ext-update-789',
                'name' => 'Original Name',
                'address' => '100 Old Street',
            ]);

        // Clear cache so the next request re-validates the token
        Cache::flush();

        // Re-fake the HTTP for the second request
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'tf@test.com',
                'name' => 'TF User',
                'plan' => 'pro',
            ]),
        ]);

        // Sync again with updated data
        $response = $this->withHeaders($headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'ext-update-789',
                'name' => 'Updated Name',
                'address' => '200 New Street',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Location synced successfully']);

        // Should have only one location, not two
        $this->assertDatabaseCount('locations', 1);
        $this->assertDatabaseHas('locations', [
            'external_facility_id' => 'ext-update-789',
            'name' => 'Updated Name',
            'address' => '200 New Street',
        ]);
    }

    // =========================================================================
    // Location Delete Tests
    // =========================================================================

    /**
     * Test deleting a location by external ID.
     */
    public function test_delete_location(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation([
            'external_facility_id' => 'ext-delete-101',
        ]);

        $response = $this->withHeaders($headers)
            ->deleteJson('/api/triggerflow/locations/ext-delete-101');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Location deleted successfully']);

        $this->assertDatabaseMissing('locations', [
            'id' => $location->id,
        ]);
    }

    // =========================================================================
    // Reviews Tests
    // =========================================================================

    /**
     * Test getting reviews returns paginated results.
     */
    public function test_get_reviews_returns_paginated(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation();

        // Create reviews for the location
        Review::factory()->count(5)->create([
            'location_id' => $location->id,
            'platform' => 'google',
            'rating' => 5,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/triggerflow/locations/ext-123/reviews');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reviews',
                'pagination' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonCount(5, 'reviews');
    }

    /**
     * Test getting reviews supports platform and status filters.
     */
    public function test_get_reviews_supports_filters(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation();

        // Create reviews with different platforms and statuses
        Review::factory()->count(3)->create([
            'location_id' => $location->id,
            'platform' => 'google',
            'status' => 'pending',
        ]);
        Review::factory()->count(2)->create([
            'location_id' => $location->id,
            'platform' => 'tripadvisor',
            'status' => 'replied',
        ]);

        // Filter by platform
        $response = $this->withHeaders($headers)
            ->getJson('/api/triggerflow/locations/ext-123/reviews?platform=google');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'reviews');

        // Clear cache and re-fake for the next request
        Cache::flush();
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'tf@test.com',
                'name' => 'TF User',
                'plan' => 'pro',
            ]),
        ]);

        // Filter by status
        $response = $this->withHeaders($headers)
            ->getJson('/api/triggerflow/locations/ext-123/reviews?status=replied');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'reviews');
    }

    // =========================================================================
    // Stats Tests
    // =========================================================================

    /**
     * Test getting stats for a location.
     */
    public function test_get_stats(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation();

        // Create reviews with varying ratings and statuses
        Review::factory()->count(3)->create([
            'location_id' => $location->id,
            'platform' => 'google',
            'rating' => 5,
            'status' => 'replied',
        ]);
        Review::factory()->count(2)->create([
            'location_id' => $location->id,
            'platform' => 'tripadvisor',
            'rating' => 1,
            'status' => 'pending',
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/triggerflow/locations/ext-123/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'total_reviews',
                    'average_rating',
                    'rating_distribution',
                    'reviews_with_reply',
                    'reviews_without_reply',
                    'reply_rate',
                    'recent_reviews_count',
                    'pending_count',
                    'replied_count',
                    'positive_count',
                    'negative_count',
                ],
                'by_platform',
            ]);

        $this->assertEquals(5, $response->json('stats.total_reviews'));
        $this->assertEquals(2, $response->json('stats.pending_count'));
        $this->assertEquals(3, $response->json('stats.replied_count'));
        $this->assertEquals(3, $response->json('stats.positive_count'));
        $this->assertEquals(2, $response->json('stats.negative_count'));
    }

    // =========================================================================
    // Connections Tests
    // =========================================================================

    /**
     * Test getting connections for a location.
     */
    public function test_get_connections(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation();

        // Create connections for the location
        ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $location->id,
        ]);
        ReviewConnection::factory()->booking()->create([
            'location_id' => $location->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson('/api/triggerflow/locations/ext-123/connections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'connections',
            ])
            ->assertJsonCount(2, 'connections');
    }

    /**
     * Test creating a new connection for a location.
     */
    public function test_create_connection(): void
    {
        $headers = $this->authenticatedHeaders();
        $location = $this->createTriggerFlowLocation();

        $response = $this->withHeaders($headers)
            ->postJson('/api/triggerflow/locations/ext-123/connections', [
                'platform' => 'tripadvisor',
                'platform_url' => 'https://www.tripadvisor.com/Restaurant_Review-d99999',
                'platform_name' => 'My Restaurant on TripAdvisor',
                'label' => 'Main TripAdvisor Page',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Connection saved successfully']);

        $this->assertDatabaseHas('review_connections', [
            'location_id' => $location->id,
            'platform' => 'tripadvisor',
            'platform_url' => 'https://www.tripadvisor.com/Restaurant_Review-d99999',
            'platform_name' => 'My Restaurant on TripAdvisor',
            'label' => 'Main TripAdvisor Page',
        ]);
    }

    // =========================================================================
    // Reply Generation Tests
    // =========================================================================

    /**
     * Test generating an AI reply through the TriggerFlow endpoint.
     */
    public function test_generate_reply(): void
    {
        // Fake both TriggerFlow auth and Gemini AI API
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'tf@test.com',
                'name' => 'TF User',
                'plan' => 'pro',
            ]),
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Thank you for your wonderful review! We are delighted you enjoyed your experience.'],
                            ],
                        ],
                    ],
                ],
                'usageMetadata' => ['totalTokenCount' => 50],
            ]),
        ]);

        // Ensure the TF user exists with quota
        User::factory()->create([
            'email' => 'tf@test.com',
            'name' => 'TF User',
            'plan' => 'pro',
            'monthly_quota' => 200,
            'quota_used_month' => 0,
            'external_user_id' => '1',
            'external_source' => 'triggerflow',
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer valid-tf-token'])
            ->postJson('/api/triggerflow/replies/generate', [
                'review_content' => 'Amazing food and great atmosphere!',
                'review_rating' => 5,
                'review_author' => 'Jane Doe',
                'platform' => 'google',
                'tone' => 'professional',
                'language' => 'en',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reply',
                'tone',
                'language',
                'tokens_used',
            ]);
    }
}
