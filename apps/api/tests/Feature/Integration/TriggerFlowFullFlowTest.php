<?php

namespace Tests\Feature\Integration;

use App\Models\Location;
use App\Models\Review;
use App\Models\ReviewConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TriggerFlowFullFlowTest extends TestCase
{
    use RefreshDatabase;

    protected array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        // Configure TriggerFlow integration
        config(['services.triggerflow.api_url' => 'https://triggerflow.test']);
        config(['services.triggerflow.api_key' => 'test-api-key']);

        // Clear cache to avoid stale token validation results
        Cache::flush();

        $this->headers = [
            'Authorization' => 'Bearer tf-token',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Set up Http::fake for valid TriggerFlow auth.
     */
    protected function fakeValidAuth(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 42,
                'email' => 'flow@test.com',
                'name' => 'Flow User',
                'plan' => 'pro',
            ]),
        ]);
    }

    /**
     * AC-010: Full flow: Auth TF -> Sync location -> Create connection -> Get reviews -> Get stats
     */
    public function test_full_triggerflow_flow(): void
    {
        $this->fakeValidAuth();

        // =====================================================================
        // Step 1: Sync a location (this also validates TF auth implicitly)
        // =====================================================================
        $syncResponse = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'facility-100',
                'name' => 'Test Hotel',
                'address' => '123 Main Street, Paris',
                'default_tone' => 'friendly',
                'default_language' => 'fr',
            ]);

        $syncResponse->assertOk()
            ->assertJsonPath('message', 'Location synced successfully')
            ->assertJsonPath('location.name', 'Test Hotel')
            ->assertJsonPath('location.external_facility_id', 'facility-100')
            ->assertJsonPath('location.external_source', 'triggerflow');

        // Verify location was created in the database
        $location = Location::where('external_facility_id', 'facility-100')
            ->where('external_source', 'triggerflow')
            ->first();

        $this->assertNotNull($location);
        $this->assertEquals('Test Hotel', $location->name);
        $this->assertEquals('123 Main Street, Paris', $location->address);
        $this->assertEquals('friendly', $location->default_tone);
        $this->assertEquals('fr', $location->default_language);

        // Verify the TriggerFlow user was created locally
        $user = User::where('email', 'flow@test.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('42', $user->external_user_id);
        $this->assertEquals('triggerflow', $user->external_source);
        $this->assertEquals('pro', $user->plan);
        $this->assertEquals($user->id, $location->user_id);

        // =====================================================================
        // Step 2: Create a connection for the location
        // =====================================================================
        $connectionResponse = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/locations/facility-100/connections', [
                'platform' => 'google',
                'platform_name' => 'Google Business',
                'platform_url' => 'https://www.google.com/maps/place/test-hotel',
                'label' => 'Main Google Profile',
            ]);

        $connectionResponse->assertOk()
            ->assertJsonPath('message', 'Connection saved successfully')
            ->assertJsonPath('connection.platform', 'google')
            ->assertJsonPath('connection.platform_name', 'Google Business')
            ->assertJsonPath('connection.is_active', true);

        // Verify connection in database
        $connection = ReviewConnection::where('location_id', $location->id)
            ->where('platform', 'google')
            ->first();

        $this->assertNotNull($connection);
        $this->assertEquals('Main Google Profile', $connection->label);
        $this->assertTrue($connection->is_active);

        // =====================================================================
        // Step 3: Create reviews directly in DB for this location
        // =====================================================================
        $reviews = Review::factory()->count(5)->create([
            'location_id' => $location->id,
            'platform' => 'google',
            'status' => 'pending',
        ]);

        // Also create some replied reviews for stat verification
        Review::factory()->count(2)->replied()->create([
            'location_id' => $location->id,
            'platform' => 'google',
            'rating' => 5,
        ]);

        // Create a negative review
        Review::factory()->negative()->create([
            'location_id' => $location->id,
            'platform' => 'google',
        ]);

        $totalReviews = 5 + 2 + 1; // 8 total

        // =====================================================================
        // Step 4: Get reviews via the TriggerFlow API
        // =====================================================================
        $reviewsResponse = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/facility-100/reviews');

        $reviewsResponse->assertOk()
            ->assertJsonCount($totalReviews, 'reviews')
            ->assertJsonStructure([
                'reviews' => [
                    '*' => [
                        'id',
                        'location_id',
                        'platform',
                        'external_id',
                        'author_name',
                        'rating',
                        'content',
                        'status',
                        'has_reply',
                        'full_comment',
                    ],
                ],
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);

        // All reviews should belong to the correct location
        $returnedReviews = $reviewsResponse->json('reviews');
        foreach ($returnedReviews as $review) {
            $this->assertEquals($location->id, $review['location_id']);
            $this->assertEquals('google', $review['platform']);
        }

        // =====================================================================
        // Step 5: Get stats via the TriggerFlow API
        // =====================================================================
        $statsResponse = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/facility-100/stats');

        $statsResponse->assertOk()
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

        $stats = $statsResponse->json('stats');

        // Verify stats are consistent with the data we created
        $this->assertEquals($totalReviews, $stats['total_reviews']);

        // 5 pending + 1 negative (pending by default) = 6 pending
        $this->assertEquals(6, $stats['pending_count']);

        // 2 replied reviews
        $this->assertEquals(2, $stats['replied_count']);

        // All reviews are Google platform
        $byPlatform = $statsResponse->json('by_platform');
        $this->assertCount(1, $byPlatform);
        $this->assertEquals('google', $byPlatform[0]['platform']);

        // =====================================================================
        // Step 6: Get connections to verify everything is linked
        // =====================================================================
        $connectionsResponse = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/facility-100/connections');

        $connectionsResponse->assertOk()
            ->assertJsonCount(1, 'connections')
            ->assertJsonPath('connections.0.platform', 'google')
            ->assertJsonPath('connections.0.platform_name', 'Google Business')
            ->assertJsonPath('connections.0.is_active', true);

        // =====================================================================
        // Step 7: Update the location (sync again with changed data)
        // =====================================================================
        $updateResponse = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'facility-100',
                'name' => 'Test Hotel Updated',
                'default_tone' => 'professional',
            ]);

        $updateResponse->assertOk()
            ->assertJsonPath('location.name', 'Test Hotel Updated');

        // Verify location was updated, not duplicated
        $this->assertEquals(1, Location::where('external_facility_id', 'facility-100')->count());

        $location->refresh();
        $this->assertEquals('Test Hotel Updated', $location->name);
        $this->assertEquals('professional', $location->default_tone);
        // Address should remain unchanged
        $this->assertEquals('123 Main Street, Paris', $location->address);
    }

    /**
     * Test that reviews can be filtered by platform when fetching.
     */
    public function test_triggerflow_reviews_filter_by_platform(): void
    {
        $this->fakeValidAuth();

        // Sync location
        $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'facility-200',
                'name' => 'Filter Test Hotel',
            ]);

        $location = Location::where('external_facility_id', 'facility-200')->first();

        // Create reviews on different platforms
        Review::factory()->count(3)->create([
            'location_id' => $location->id,
            'platform' => 'google',
        ]);
        Review::factory()->count(2)->create([
            'location_id' => $location->id,
            'platform' => 'tripadvisor',
        ]);

        // Filter by google only
        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/facility-200/reviews?platform=google');

        $response->assertOk()
            ->assertJsonCount(3, 'reviews');

        // Filter by tripadvisor only
        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/facility-200/reviews?platform=tripadvisor');

        $response->assertOk()
            ->assertJsonCount(2, 'reviews');
    }

    /**
     * Test that requesting a non-existent location returns 404.
     */
    public function test_triggerflow_returns_404_for_unknown_location(): void
    {
        $this->fakeValidAuth();

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/non-existent/reviews');

        $response->assertNotFound()
            ->assertJsonPath('message', 'Location not found');

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/non-existent/stats');

        $response->assertNotFound()
            ->assertJsonPath('message', 'Location not found');
    }

    /**
     * Test that TriggerFlow auth rejects requests without a token.
     */
    public function test_triggerflow_rejects_missing_token(): void
    {
        $this->fakeValidAuth();

        $response = $this->postJson('/api/triggerflow/locations/sync', [
            'external_id' => 'facility-300',
            'name' => 'Unauthorized Hotel',
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Test that TriggerFlow auth rejects invalid tokens.
     */
    public function test_triggerflow_rejects_invalid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([], 401),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token',
            'Accept' => 'application/json',
        ])->postJson('/api/triggerflow/locations/sync', [
            'external_id' => 'facility-400',
            'name' => 'Bad Token Hotel',
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Test that location deletion via TriggerFlow works correctly.
     */
    public function test_triggerflow_delete_location(): void
    {
        $this->fakeValidAuth();

        // Create a location first
        $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/locations/sync', [
                'external_id' => 'facility-500',
                'name' => 'Deletable Hotel',
            ]);

        $this->assertNotNull(
            Location::where('external_facility_id', 'facility-500')->first()
        );

        // Delete it
        $deleteResponse = $this->withHeaders($this->headers)
            ->deleteJson('/api/triggerflow/locations/facility-500');

        $deleteResponse->assertOk()
            ->assertJsonPath('message', 'Location deleted successfully');

        // Verify it is gone
        $this->assertNull(
            Location::where('external_facility_id', 'facility-500')->first()
        );
    }
}
