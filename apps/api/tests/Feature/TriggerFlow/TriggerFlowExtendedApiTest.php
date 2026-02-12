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

/**
 * Tests for the extended TriggerFlow API endpoints (Sprint 3 migration).
 */
class TriggerFlowExtendedApiTest extends TestCase
{
    use RefreshDatabase;

    protected array $headers;
    protected User $user;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.triggerflow.api_url' => 'https://triggerflow.test']);
        config(['services.triggerflow.api_key' => 'test-api-key']);
        Cache::flush();

        $this->headers = ['Authorization' => 'Bearer tf-token'];

        // Pre-create user and location
        $this->user = User::factory()->create([
            'email' => 'tf-ext@test.com',
            'name' => 'TF Extended User',
            'plan' => 'pro',
            'external_user_id' => '99',
            'external_source' => 'triggerflow',
        ]);

        $this->location = Location::factory()->create([
            'user_id' => $this->user->id,
            'external_facility_id' => 'ext-loc-1',
            'external_source' => 'triggerflow',
            'name' => 'Test Hotel',
        ]);
    }

    protected function fakeAuth(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 99,
                'email' => 'tf-ext@test.com',
                'name' => 'TF Extended User',
                'plan' => 'pro',
            ]),
        ]);
    }

    // =========================================================================
    // Reviews - Enhanced Listing
    // =========================================================================

    public function test_reviews_listing_with_standard_pagination(): void
    {
        $this->fakeAuth();

        Review::factory()->count(25)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?per_page=10');

        $response->assertOk()
            ->assertJsonCount(10, 'reviews')
            ->assertJsonPath('pagination.current_page', 1)
            ->assertJsonPath('pagination.per_page', 10)
            ->assertJsonPath('pagination.total', 25)
            ->assertJsonPath('pagination.last_page', 3);
    }

    public function test_reviews_listing_filters_by_platforms_array(): void
    {
        $this->fakeAuth();

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
        ]);
        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'platform' => 'booking',
        ]);
        Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?platforms[]=google&platforms[]=booking');

        $response->assertOk()
            ->assertJsonCount(5, 'reviews');
    }

    public function test_reviews_listing_filters_by_ratings(): void
    {
        $this->fakeAuth();

        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'rating' => 5,
        ]);
        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'rating' => 1,
        ]);
        Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'rating' => 3,
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?ratings[]=1&ratings[]=5');

        $response->assertOk()
            ->assertJsonCount(5, 'reviews');
    }

    public function test_reviews_listing_filters_by_has_reply(): void
    {
        $this->fakeAuth();

        Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
            'reply' => 'Thanks for your feedback!',
        ]);
        Review::factory()->count(2)->create([
            'location_id' => $this->location->id,
            'reply' => null,
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?has_reply=true');

        $response->assertOk()
            ->assertJsonCount(3, 'reviews');

        Cache::flush();
        $this->fakeAuth();

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?has_reply=false');

        $response->assertOk()
            ->assertJsonCount(2, 'reviews');
    }

    public function test_reviews_listing_search(): void
    {
        $this->fakeAuth();

        Review::factory()->create([
            'location_id' => $this->location->id,
            'content' => 'The breakfast was absolutely fantastic!',
        ]);
        Review::factory()->create([
            'location_id' => $this->location->id,
            'content' => 'Terrible room service.',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?search=breakfast');

        $response->assertOk()
            ->assertJsonCount(1, 'reviews');
    }

    public function test_reviews_listing_sort_by_rating(): void
    {
        $this->fakeAuth();

        Review::factory()->create([
            'location_id' => $this->location->id,
            'rating' => 1,
        ]);
        Review::factory()->create([
            'location_id' => $this->location->id,
            'rating' => 5,
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews?sort_by=rating&sort_order=asc');

        $response->assertOk();
        $reviews = $response->json('reviews');
        $this->assertLessThanOrEqual(
            $reviews[1]['normalized_rating'],
            $reviews[0]['normalized_rating']
        );
    }

    public function test_reviews_response_includes_enriched_fields(): void
    {
        $this->fakeAuth();

        Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'booking',
            'positive_comment' => 'Great pool!',
            'negative_comment' => 'Noisy room.',
            'reply' => 'Thank you!',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/reviews');

        $response->assertOk();
        $review = $response->json('reviews.0');
        $this->assertTrue($review['has_reply']);
        $this->assertNotEmpty($review['full_comment']);
    }

    // =========================================================================
    // Stats - Extended
    // =========================================================================

    public function test_stats_includes_rating_distribution(): void
    {
        $this->fakeAuth();

        Review::factory()->count(2)->create(['location_id' => $this->location->id, 'platform' => 'google', 'rating' => 5]);
        Review::factory()->create(['location_id' => $this->location->id, 'platform' => 'google', 'rating' => 3]);
        Review::factory()->create(['location_id' => $this->location->id, 'platform' => 'google', 'rating' => 1]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/stats');

        $response->assertOk();
        $stats = $response->json('stats');

        $this->assertEquals(4, $stats['total_reviews']);
        $this->assertArrayHasKey('rating_distribution', $stats);
        $this->assertEquals(2, $stats['rating_distribution']['5']);
        $this->assertEquals(1, $stats['rating_distribution']['3']);
        $this->assertEquals(1, $stats['rating_distribution']['1']);
        $this->assertArrayHasKey('reply_rate', $stats);
        $this->assertArrayHasKey('reviews_with_reply', $stats);
    }

    public function test_stats_by_platform_includes_booking_original_rating(): void
    {
        $this->fakeAuth();

        Review::factory()->booking()->create(['location_id' => $this->location->id]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/stats');

        $response->assertOk();
        $byPlatform = $response->json('by_platform');
        $bookingPlatform = collect($byPlatform)->firstWhere('platform', 'booking');

        $this->assertNotNull($bookingPlatform);
        $this->assertArrayHasKey('avg_original_rating', $bookingPlatform);
    }

    // =========================================================================
    // Review Update
    // =========================================================================

    public function test_update_review_status(): void
    {
        $this->fakeAuth();

        $review = Review::factory()->create([
            'location_id' => $this->location->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeaders($this->headers)
            ->patchJson("/api/triggerflow/reviews/{$review->id}", [
                'status' => 'replied',
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Review updated successfully')
            ->assertJsonPath('review.status', 'replied');
    }

    public function test_update_review_validates_status(): void
    {
        $this->fakeAuth();

        $review = Review::factory()->create([
            'location_id' => $this->location->id,
        ]);

        $response = $this->withHeaders($this->headers)
            ->patchJson("/api/triggerflow/reviews/{$review->id}", [
                'status' => 'invalid',
            ]);

        $response->assertStatus(422);
    }

    public function test_update_review_returns_404_for_other_users_review(): void
    {
        $this->fakeAuth();

        $otherUser = User::factory()->create();
        $otherLocation = Location::factory()->create(['user_id' => $otherUser->id]);
        $review = Review::factory()->create(['location_id' => $otherLocation->id]);

        $response = $this->withHeaders($this->headers)
            ->patchJson("/api/triggerflow/reviews/{$review->id}", [
                'status' => 'replied',
            ]);

        $response->assertNotFound();
    }

    // =========================================================================
    // Google Reply Posting
    // =========================================================================

    public function test_reply_to_review_rejects_non_google(): void
    {
        $this->fakeAuth();

        $review = Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'tripadvisor',
            'can_reply' => true,
        ]);

        $response = $this->withHeaders($this->headers)
            ->postJson("/api/triggerflow/reviews/{$review->id}/reply", [
                'comment' => 'Thank you!',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Reply posting is only supported for Google reviews');
    }

    public function test_reply_to_review_rejects_non_replyable(): void
    {
        $this->fakeAuth();

        $review = Review::factory()->create([
            'location_id' => $this->location->id,
            'platform' => 'google',
            'can_reply' => false,
        ]);

        $response = $this->withHeaders($this->headers)
            ->postJson("/api/triggerflow/reviews/{$review->id}/reply", [
                'comment' => 'Thank you!',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This review cannot receive replies via API');
    }

    // =========================================================================
    // Bulk Reply Generation
    // =========================================================================

    public function test_bulk_generate_replies(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 99,
                'email' => 'tf-ext@test.com',
                'name' => 'TF Extended User',
                'plan' => 'pro',
            ]),
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    ['content' => ['parts' => [['text' => 'Thank you for your review!']]]],
                ],
                'usageMetadata' => ['totalTokenCount' => 30],
            ]),
        ]);

        $reviews = Review::factory()->count(3)->create([
            'location_id' => $this->location->id,
        ]);

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/replies/bulk-generate', [
                'review_ids' => $reviews->pluck('id')->toArray(),
                'tone' => 'professional',
                'language' => 'en',
            ]);

        $response->assertOk()
            ->assertJsonPath('total_requested', 3)
            ->assertJsonPath('total_generated', 3)
            ->assertJsonPath('total_failed', 0)
            ->assertJsonCount(3, 'results');

        foreach ($response->json('results') as $result) {
            $this->assertTrue($result['success']);
            $this->assertNotEmpty($result['reply']);
        }
    }

    public function test_bulk_generate_rejects_more_than_50(): void
    {
        $this->fakeAuth();

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/replies/bulk-generate', [
                'review_ids' => range(1, 51),
            ]);

        $response->assertStatus(422);
    }

    public function test_bulk_generate_reports_inaccessible_reviews(): void
    {
        $this->fakeAuth();

        $otherUser = User::factory()->create();
        $otherLocation = Location::factory()->create(['user_id' => $otherUser->id]);
        $foreignReview = Review::factory()->create(['location_id' => $otherLocation->id]);

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/replies/bulk-generate', [
                'review_ids' => [$foreignReview->id],
            ]);

        $response->assertOk()
            ->assertJsonPath('total_failed', 1)
            ->assertJsonPath('results.0.success', false)
            ->assertJsonPath('results.0.error', 'Review not found or not accessible');
    }

    // =========================================================================
    // Connection CRUD
    // =========================================================================

    public function test_show_connection(): void
    {
        $this->fakeAuth();

        $connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson("/api/triggerflow/locations/ext-loc-1/connections/{$connection->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'connection' => [
                    'id', 'platform', 'is_active', 'reviews_count',
                    'is_configured', 'needs_reconnect', 'average_rating',
                ],
            ]);
    }

    public function test_update_connection(): void
    {
        $this->fakeAuth();

        $connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
            'label' => 'Old Label',
        ]);

        $response = $this->withHeaders($this->headers)
            ->patchJson("/api/triggerflow/locations/ext-loc-1/connections/{$connection->id}", [
                'label' => 'New Label',
                'is_active' => false,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Connection updated successfully');

        $connection->refresh();
        $this->assertEquals('New Label', $connection->label);
        $this->assertFalse($connection->is_active);
    }

    public function test_delete_connection(): void
    {
        $this->fakeAuth();

        $connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
        ]);

        $response = $this->withHeaders($this->headers)
            ->deleteJson("/api/triggerflow/locations/ext-loc-1/connections/{$connection->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Connection deleted successfully');

        // Soft deleted
        $this->assertSoftDeleted('review_connections', ['id' => $connection->id]);
    }

    public function test_sync_connection_rejects_when_locked(): void
    {
        $this->fakeAuth();

        $connection = ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
            'is_active' => true,
            'sync_started_at' => now(),
        ]);

        $response = $this->withHeaders($this->headers)
            ->postJson("/api/triggerflow/locations/ext-loc-1/connections/{$connection->id}/sync");

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Sync is already in progress');
    }

    // =========================================================================
    // Alerts
    // =========================================================================

    public function test_get_alerts(): void
    {
        $this->fakeAuth();

        $this->location->update([
            'alerts_enabled' => true,
            'alert_email' => 'alerts@test.com',
            'alert_on_1_star' => true,
            'alert_recap_frequency' => 'daily',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/alerts');

        $response->assertOk()
            ->assertJsonPath('alerts.alerts_enabled', true)
            ->assertJsonPath('alerts.alert_email', 'alerts@test.com')
            ->assertJsonPath('alerts.alert_on_1_star', true)
            ->assertJsonPath('alerts.alert_recap_frequency', 'daily');
    }

    public function test_update_alerts(): void
    {
        $this->fakeAuth();

        $response = $this->withHeaders($this->headers)
            ->putJson('/api/triggerflow/locations/ext-loc-1/alerts', [
                'alerts_enabled' => true,
                'alert_email' => 'new@test.com',
                'alert_on_1_star' => true,
                'alert_on_2_star' => false,
                'alert_recap_frequency' => 'weekly',
                'alert_recap_emails' => 'manager@test.com;director@test.com',
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Alert settings updated successfully');

        $this->location->refresh();
        $this->assertTrue($this->location->alerts_enabled);
        $this->assertEquals('new@test.com', $this->location->alert_email);
        $this->assertTrue($this->location->alert_on_1_star);
        $this->assertFalse($this->location->alert_on_2_star);
        $this->assertEquals('weekly', $this->location->alert_recap_frequency);
        $this->assertEquals('manager@test.com;director@test.com', $this->location->alert_recap_emails);
    }

    // =========================================================================
    // Group / Multi-facility
    // =========================================================================

    public function test_get_facility_children(): void
    {
        $this->fakeAuth();

        // Create a second location for the same user
        Location::factory()->create([
            'user_id' => $this->user->id,
            'external_facility_id' => 'ext-loc-2',
            'external_source' => 'triggerflow',
            'name' => 'Second Hotel',
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/facilities/children');

        $response->assertOk()
            ->assertJsonCount(2, 'facilities');

        $facilities = $response->json('facilities');
        $names = collect($facilities)->pluck('name')->toArray();
        $this->assertContains('Test Hotel', $names);
        $this->assertContains('Second Hotel', $names);
    }

    public function test_get_group_platforms(): void
    {
        $this->fakeAuth();

        ReviewConnection::factory()->tripadvisor()->create([
            'location_id' => $this->location->id,
            'is_active' => true,
        ]);

        $location2 = Location::factory()->create([
            'user_id' => $this->user->id,
            'external_facility_id' => 'ext-loc-2',
            'external_source' => 'triggerflow',
        ]);

        ReviewConnection::factory()->booking()->create([
            'location_id' => $location2->id,
            'is_active' => true,
        ]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/facilities/group-platforms');

        $response->assertOk()
            ->assertJsonCount(2, 'platforms');
    }

    public function test_stats_with_group_includes_by_facility(): void
    {
        $this->fakeAuth();

        $location2 = Location::factory()->create([
            'user_id' => $this->user->id,
            'external_facility_id' => 'ext-loc-2',
            'external_source' => 'triggerflow',
            'name' => 'Second Hotel',
        ]);

        Review::factory()->count(3)->create(['location_id' => $this->location->id, 'rating' => 5]);
        Review::factory()->count(2)->create(['location_id' => $location2->id, 'rating' => 3]);

        $response = $this->withHeaders($this->headers)
            ->getJson('/api/triggerflow/locations/ext-loc-1/stats?include_group=true');

        $response->assertOk()
            ->assertJsonStructure(['stats', 'by_platform', 'by_facility']);

        $byFacility = $response->json('by_facility');
        $this->assertCount(2, $byFacility);
        $this->assertEquals(5, $response->json('stats.total_reviews'));
    }

    // =========================================================================
    // Quota Bypass
    // =========================================================================

    public function test_triggerflow_user_bypasses_quota(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 99,
                'email' => 'tf-ext@test.com',
                'name' => 'TF Extended User',
                'plan' => 'pro',
            ]),
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    ['content' => ['parts' => [['text' => 'AI reply here']]]],
                ],
                'usageMetadata' => ['totalTokenCount' => 20],
            ]),
        ]);

        // Set user's quota to 0 - should still work since TF users bypass quota
        $this->user->update([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 10,
        ]);

        $response = $this->withHeaders($this->headers)
            ->postJson('/api/triggerflow/replies/generate', [
                'review_content' => 'Good food!',
                'review_rating' => 5,
                'platform' => 'google',
            ]);

        // Should succeed despite exhausted quota
        $response->assertOk()
            ->assertJsonStructure(['reply', 'tone', 'language']);
    }

    // =========================================================================
    // Filter multi-location reviews
    // =========================================================================

    public function test_reviews_filter_by_location_ids(): void
    {
        $this->fakeAuth();

        $location2 = Location::factory()->create([
            'user_id' => $this->user->id,
            'external_facility_id' => 'ext-loc-2',
            'external_source' => 'triggerflow',
        ]);

        Review::factory()->count(3)->create(['location_id' => $this->location->id]);
        Review::factory()->count(2)->create(['location_id' => $location2->id]);

        $response = $this->withHeaders($this->headers)
            ->getJson("/api/triggerflow/locations/ext-loc-1/reviews?filter_location_ids[]={$this->location->id}&filter_location_ids[]={$location2->id}");

        $response->assertOk()
            ->assertJsonCount(5, 'reviews');
    }
}
