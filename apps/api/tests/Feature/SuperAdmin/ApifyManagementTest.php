<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\ApifyRequest;
use App\Models\Location;
use App\Models\ReviewConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApifyManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;
    protected string $superAdminToken;
    protected string $regularUserToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'plan' => 'business',
        ]);
        $this->superAdminToken = $this->superAdmin->createToken('test-token')->plainTextToken;

        $this->regularUser = User::factory()->create([
            'is_super_admin' => false,
            'plan' => 'free',
        ]);
        $this->regularUserToken = $this->regularUser->createToken('test-token')->plainTextToken;
    }

    // =========================================================================
    // Authorization Tests
    // =========================================================================

    /**
     * Test that a regular user gets 403 when accessing super admin endpoints.
     */
    public function test_regular_user_gets_403(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->regularUserToken)
            ->getJson('/api/super-admin/locations');

        $response->assertStatus(403);
    }

    /**
     * Test that an unauthenticated request gets 401.
     */
    public function test_unauthenticated_gets_401(): void
    {
        $response = $this->getJson('/api/super-admin/locations');

        $response->assertStatus(401);
    }

    // =========================================================================
    // Connection Listing Tests
    // =========================================================================

    /**
     * Test listing connections for a specific location.
     */
    public function test_lists_connections_for_location(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);

        ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $location->id,
        ]);
        ReviewConnection::factory()->booking()->create([
            'location_id' => $location->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson("/api/super-admin/locations/{$location->id}/connections");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'location' => ['id', 'name', 'external_facility_id'],
                'connections',
            ])
            ->assertJsonCount(2, 'connections');
    }

    // =========================================================================
    // Apify Toggle Tests
    // =========================================================================

    /**
     * Test toggling Apify on a compatible connection.
     */
    public function test_toggles_apify_on_connection(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        $connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $location->id,
            'apify_enabled' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/super-admin/connections/{$connection->id}/apify", [
                'enabled' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Apify enabled for this connection']);

        $connection->refresh();
        $this->assertTrue($connection->apify_enabled);
    }

    /**
     * Test that toggling Apify on a Google connection is rejected.
     * Google uses OAuth, not Apify scraping.
     */
    public function test_toggle_rejects_google_platform(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        $connection = ReviewConnection::factory()->google()->create([
            'location_id' => $location->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/super-admin/connections/{$connection->id}/apify", [
                'enabled' => true,
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'This platform does not support Apify scraping']);
    }

    // =========================================================================
    // Apify Requests Listing Tests
    // =========================================================================

    /**
     * Test listing Apify requests.
     */
    public function test_lists_apify_requests(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        $connection = ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);

        ApifyRequest::factory()->count(3)->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/apify-requests');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'requests',
                'next_cursor',
                'has_more',
            ])
            ->assertJsonCount(3, 'requests');
    }

    /**
     * Test listing Apify requests with status and platform filters.
     */
    public function test_lists_apify_requests_with_filters(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        $connection = ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);
        $bookingConnection = ReviewConnection::factory()->booking()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);

        // Create requests with different statuses and platforms
        ApifyRequest::factory()->count(2)->completed()->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);
        ApifyRequest::factory()->failed()->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);
        ApifyRequest::factory()->create([
            'review_connection_id' => $bookingConnection->id,
            'platform' => 'booking',
        ]);

        // Filter by status
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/apify-requests?status=completed');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'requests');

        // Filter by platform
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/apify-requests?platform=booking');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'requests');
    }

    // =========================================================================
    // Apify Connections Listing Tests
    // =========================================================================

    /**
     * Test listing all connections with Apify enabled.
     */
    public function test_lists_apify_connections(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);

        ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);
        ReviewConnection::factory()->booking()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);
        // This one should not appear (apify_enabled = false)
        ReviewConnection::factory()->airbnb()->create([
            'location_id' => $location->id,
            'apify_enabled' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/apify-connections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'connections',
                'total',
            ])
            ->assertJson(['total' => 2])
            ->assertJsonCount(2, 'connections');
    }

    // =========================================================================
    // Apify Stats Tests
    // =========================================================================

    /**
     * Test getting Apify stats overview.
     */
    public function test_shows_apify_stats(): void
    {
        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        $connection = ReviewConnection::factory()->tripadvisor()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);
        $bookingConnection = ReviewConnection::factory()->booking()->apifyEnabled()->create([
            'location_id' => $location->id,
        ]);

        // Create requests with various statuses
        ApifyRequest::factory()->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
            'status' => ApifyRequest::STATUS_PENDING,
        ]);
        ApifyRequest::factory()->running()->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);
        ApifyRequest::factory()->completed(30)->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);
        ApifyRequest::factory()->completed(20)->create([
            'review_connection_id' => $bookingConnection->id,
            'platform' => 'booking',
        ]);
        ApifyRequest::factory()->failed()->create([
            'review_connection_id' => $connection->id,
            'platform' => 'tripadvisor',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/apify-stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'total_requests',
                    'pending',
                    'running',
                    'completed',
                    'failed',
                    'total_reviews_received',
                    'enabled_connections',
                ],
                'by_platform',
                'recent_requests',
            ]);

        $stats = $response->json('stats');
        $this->assertEquals(5, $stats['total_requests']);
        $this->assertEquals(1, $stats['pending']);
        $this->assertEquals(1, $stats['running']);
        $this->assertEquals(2, $stats['completed']);
        $this->assertEquals(1, $stats['failed']);
        $this->assertEquals(50, $stats['total_reviews_received']); // 30 + 20
        $this->assertEquals(2, $stats['enabled_connections']);
    }
}
