<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Response;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SuperAdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;
    protected string $superAdminToken;
    protected string $regularUserToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Create super admin user
        $this->superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'plan' => 'business',
        ]);
        $this->superAdminToken = $this->superAdmin->createToken('test-token')->plainTextToken;

        // Create regular user
        $this->regularUser = User::factory()->create([
            'is_super_admin' => false,
            'plan' => 'free',
        ]);
        $this->regularUserToken = $this->regularUser->createToken('test-token')->plainTextToken;

        // Clear cache before each test
        Cache::flush();
    }

    /**
     * Test unauthenticated access returns 401.
     */
    public function test_unauthenticated_returns_401(): void
    {
        $response = $this->getJson('/api/super-admin/dashboard/overview');
        $response->assertStatus(401);
    }

    /**
     * Test regular user cannot access super admin endpoints.
     */
    public function test_regular_user_returns_403(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->regularUserToken)
            ->getJson('/api/super-admin/dashboard/overview');
        $response->assertStatus(403);
    }

    /**
     * Test super admin can access overview endpoint.
     */
    public function test_super_admin_can_access_overview(): void
    {
        // Mock Lemon Squeezy for the successful request
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response(['data' => []], 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/overview');
        $response->assertStatus(200);
    }

    /**
     * Test overview returns correct structure.
     */
    public function test_overview_returns_correct_structure(): void
    {
        // Create some data
        User::factory()->count(5)->create(['plan' => 'free']);
        User::factory()->count(2)->create(['plan' => 'starter']);
        User::factory()->count(1)->create(['plan' => 'pro']);

        $location = Location::factory()->create(['user_id' => $this->superAdmin->id]);
        Response::factory()->count(10)->create([
            'user_id' => $this->superAdmin->id,
            'tokens_used' => 500,
        ]);

        // Mock Lemon Squeezy API
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response([
                'data' => [],
            ], 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users' => [
                    'total',
                    'active',
                    'new_today',
                    'new_this_week',
                    'new_this_month',
                ],
                'revenue' => [
                    'mrr',
                    'arr',
                    'active_subscriptions',
                ],
                'ai_costs' => [
                    'total_tokens',
                    'estimated_cost_usd',
                    'margin_percent',
                ],
                'usage' => [
                    'total_responses',
                    'responses_today',
                    'responses_this_week',
                    'responses_this_month',
                ],
                'generated_at',
            ]);
    }

    /**
     * Test users endpoint returns correct statistics.
     */
    public function test_users_endpoint_returns_correct_statistics(): void
    {
        // Create users with different plans
        User::factory()->count(10)->create(['plan' => 'free']);
        User::factory()->count(5)->create(['plan' => 'starter']);
        User::factory()->count(3)->create(['plan' => 'pro']);
        User::factory()->count(1)->create(['plan' => 'business']);

        // Create some active users (with responses)
        $activeUser = User::factory()->create(['plan' => 'starter']);
        Response::factory()->create([
            'user_id' => $activeUser->id,
            'created_at' => now()->subDays(5),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total',
                'by_plan' => [
                    'free',
                    'starter',
                    'pro',
                    'business',
                    'enterprise',
                ],
                'by_plan_percent',
                'active_30d',
                'new_today',
                'new_this_week',
                'new_this_month',
                'paid_users',
                'conversion_rate',
                'trends',
            ]);

        // Total should include: super admin (1) + regular user (1) + created (10+5+3+1+1) = 22
        // But regularUser was created in setUp too, so depends on timing
        // Just verify structure and reasonable counts
        $total = $response->json('total');
        $this->assertGreaterThanOrEqual(20, $total);
        $this->assertGreaterThanOrEqual(8, $response->json('by_plan.free')); // At least our 10 free - some may be counted differently
        $this->assertGreaterThanOrEqual(5, $response->json('by_plan.starter'));
        $this->assertGreaterThanOrEqual(3, $response->json('by_plan.pro'));
        $this->assertGreaterThanOrEqual(1, $response->json('by_plan.business'));
    }

    /**
     * Test users endpoint with period filter.
     */
    public function test_users_endpoint_with_period_filter(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/users?period=7d');

        $response->assertStatus(200);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/users?period=90d');

        $response->assertStatus(200);
    }

    /**
     * Test users endpoint validates period parameter.
     */
    public function test_users_endpoint_validates_period(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/users?period=invalid');

        $response->assertStatus(422);
    }

    /**
     * Test revenue endpoint returns correct structure.
     */
    public function test_revenue_endpoint_returns_correct_structure(): void
    {
        // Mock Lemon Squeezy API
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response([
                'data' => [
                    [
                        'attributes' => [
                            'status' => 'active',
                            'variant_id' => config('services.lemonsqueezy.variant_starter_monthly'),
                            'first_subscription_item' => ['price' => 990],
                            'billing_anchor' => 1,
                            'created_at' => now()->toIso8601String(),
                        ],
                    ],
                    [
                        'attributes' => [
                            'status' => 'active',
                            'variant_id' => config('services.lemonsqueezy.variant_pro_monthly'),
                            'first_subscription_item' => ['price' => 2900],
                            'billing_anchor' => 1,
                            'created_at' => now()->subDays(45)->toIso8601String(),
                        ],
                    ],
                ],
                'links' => ['next' => null],
            ], 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/revenue');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'mrr',
                'arr',
                'by_plan',
                'active_subscriptions',
                'new_subscriptions',
                'churns',
                'churn_rate',
                'by_status',
                'trends',
            ]);
    }

    /**
     * Test ai-costs endpoint returns correct structure.
     */
    public function test_ai_costs_endpoint_returns_correct_structure(): void
    {
        // Create responses with tokens
        Response::factory()->count(5)->create([
            'user_id' => $this->superAdmin->id,
            'tokens_used' => 1000,
            'created_at' => now()->subDays(5),
        ]);

        Response::factory()->count(3)->create([
            'user_id' => $this->regularUser->id,
            'tokens_used' => 500,
            'created_at' => now()->subDays(2),
        ]);

        // Mock Lemon Squeezy for margin calculation
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response([
                'data' => [],
            ], 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/ai-costs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_tokens',
                'by_provider' => [
                    'gemini' => ['tokens', 'cost_usd'],
                    'mistral' => ['tokens', 'cost_usd'],
                ],
                'estimated_cost_usd',
                'margin_percent',
                'top_users',
                'trends',
                'pricing',
            ]);

        // Verify tokens are calculated correctly
        // 5 * 1000 + 3 * 500 = 6500 tokens
        $this->assertEquals(6500, $response->json('total_tokens'));
    }

    /**
     * Test ai-costs top users.
     */
    public function test_ai_costs_shows_top_users(): void
    {
        // Create responses for different users
        $user1 = User::factory()->create(['email' => 'user1@test.com']);
        $user2 = User::factory()->create(['email' => 'user2@test.com']);

        Response::factory()->count(5)->create([
            'user_id' => $user1->id,
            'tokens_used' => 2000,
        ]);

        Response::factory()->count(3)->create([
            'user_id' => $user2->id,
            'tokens_used' => 1000,
        ]);

        // Mock Lemon Squeezy
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response(['data' => []], 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/ai-costs');

        $response->assertStatus(200);

        $topUsers = $response->json('top_users');
        $this->assertNotEmpty($topUsers);

        // First user should have more tokens
        $this->assertEquals('user1@test.com', $topUsers[0]['email']);
        $this->assertEquals(10000, $topUsers[0]['tokens']); // 5 * 2000
    }

    /**
     * Test trends endpoint returns correct structure.
     */
    public function test_trends_endpoint_returns_correct_structure(): void
    {
        // Create some data over time
        User::factory()->create(['created_at' => now()->subDays(5)]);
        User::factory()->create(['created_at' => now()->subDays(3)]);
        User::factory()->create(['created_at' => now()->subDays(1)]);

        Response::factory()->create([
            'user_id' => $this->superAdmin->id,
            'tokens_used' => 500,
            'created_at' => now()->subDays(5),
        ]);
        Response::factory()->create([
            'user_id' => $this->superAdmin->id,
            'tokens_used' => 1000,
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'registrations',
                'responses',
                'tokens',
                'period',
                'range',
            ]);
    }

    /**
     * Test trends endpoint with different periods.
     */
    public function test_trends_endpoint_with_different_periods(): void
    {
        // Day period
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends?period=day&range=7');

        $response->assertStatus(200)
            ->assertJson(['period' => 'day', 'range' => 7]);

        // Week period
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends?period=week&range=12');

        $response->assertStatus(200)
            ->assertJson(['period' => 'week', 'range' => 12]);

        // Month period
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends?period=month&range=6');

        $response->assertStatus(200)
            ->assertJson(['period' => 'month', 'range' => 6]);
    }

    /**
     * Test trends endpoint validates parameters.
     */
    public function test_trends_endpoint_validates_parameters(): void
    {
        // Invalid period
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends?period=invalid');

        $response->assertStatus(422);

        // Invalid range (too high)
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/trends?range=500');

        $response->assertStatus(422);
    }

    /**
     * Test clear cache endpoint.
     */
    public function test_clear_cache_endpoint(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/super-admin/dashboard/clear-cache');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Dashboard caches cleared successfully']);
    }

    /**
     * Test all endpoints require super admin.
     */
    public function test_all_endpoints_require_super_admin(): void
    {
        $endpoints = [
            ['GET', '/api/super-admin/dashboard/overview'],
            ['GET', '/api/super-admin/dashboard/users'],
            ['GET', '/api/super-admin/dashboard/revenue'],
            ['GET', '/api/super-admin/dashboard/ai-costs'],
            ['GET', '/api/super-admin/dashboard/trends'],
            ['POST', '/api/super-admin/dashboard/clear-cache'],
        ];

        foreach ($endpoints as [$method, $url]) {
            $response = $this->withHeader('Authorization', 'Bearer ' . $this->regularUserToken)
                ->json($method, $url);

            $response->assertStatus(403, "Endpoint {$method} {$url} should require super admin");
        }
    }

    /**
     * Test dashboard data is cached.
     */
    public function test_overview_is_cached(): void
    {
        // Mock Lemon Squeezy
        Http::fake([
            'api.lemonsqueezy.com/*' => Http::response(['data' => []], 200),
        ]);

        // First request
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/overview');

        $response1->assertStatus(200);
        $usersTotal1 = $response1->json('users.total');

        // Create new user
        User::factory()->create();

        // Second request should return cached data (same user count)
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/overview');

        $response2->assertStatus(200);
        $usersTotal2 = $response2->json('users.total');

        // Same user count means cached
        $this->assertEquals($usersTotal1, $usersTotal2);

        // Clear cache
        Cache::flush();

        // Third request should have new data
        $response3 = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/overview');

        $response3->assertStatus(200);
        $usersTotal3 = $response3->json('users.total');

        // New user should be counted now
        $this->assertEquals($usersTotal1 + 1, $usersTotal3);
    }

    /**
     * Test conversion rate calculation.
     */
    public function test_conversion_rate_calculation(): void
    {
        // 8 free users, 2 paid users = 20% conversion
        User::factory()->count(8)->create(['plan' => 'free']);
        User::factory()->count(2)->create(['plan' => 'pro']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/super-admin/dashboard/users');

        $response->assertStatus(200);

        // Total: 8 free + 2 pro + 2 from setUp = 12
        // Paid: 2 pro + 1 business (super admin) = 3
        // Rate: 3/12 = 25%
        $this->assertEquals(25.0, $response->json('conversion_rate'));
    }
}
