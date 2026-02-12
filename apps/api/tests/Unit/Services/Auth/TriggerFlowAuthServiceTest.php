<?php

namespace Tests\Unit\Services\Auth;

use App\Models\User;
use App\Services\Auth\TriggerFlowAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TriggerFlowAuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private TriggerFlowAuthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.triggerflow.api_url' => 'https://triggerflow.test',
            'services.triggerflow.api_key' => 'test-api-key',
        ]);

        $this->service = new TriggerFlowAuthService();
    }

    // ========================================
    // validateToken() Tests
    // ========================================

    public function test_validates_valid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 123,
                'email' => 'user@example.com',
                'name' => 'John Doe',
                'plan' => 'pro',
            ], 200),
        ]);

        Cache::flush();

        $result = $this->service->validateToken('valid-token');

        $this->assertNotNull($result);
        $this->assertEquals(123, $result['id']);
        $this->assertEquals('user@example.com', $result['email']);
        $this->assertEquals('John Doe', $result['name']);
        $this->assertEquals('pro', $result['plan']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://triggerflow.test/api/auth/user'
                && $request->hasHeader('Authorization', 'Bearer valid-token');
        });
    }

    public function test_returns_null_for_invalid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response(['error' => 'Unauthenticated'], 401),
        ]);

        Cache::flush();

        $result = $this->service->validateToken('invalid-token');

        $this->assertNull($result);
    }

    public function test_returns_null_for_api_error(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response('Internal Server Error', 500),
        ]);

        Cache::flush();

        $result = $this->service->validateToken('some-token');

        $this->assertNull($result);
    }

    public function test_caches_token_validation(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 123,
                'email' => 'user@example.com',
                'name' => 'John Doe',
                'plan' => 'free',
            ], 200),
        ]);

        Cache::flush();

        // First call should hit the API
        $result1 = $this->service->validateToken('cached-token');
        $this->assertNotNull($result1);

        // Second call should use cache (no additional HTTP call)
        $result2 = $this->service->validateToken('cached-token');
        $this->assertNotNull($result2);
        $this->assertEquals($result1, $result2);

        // Only one HTTP request should have been made
        Http::assertSentCount(1);

        // Verify the cache key exists
        $cacheKey = 'triggerflow_token:' . hash('sha256', 'cached-token');
        $this->assertTrue(Cache::has($cacheKey));
    }

    // ========================================
    // findOrCreateUser() Tests
    // ========================================

    public function test_find_or_create_user_creates_new(): void
    {
        $triggerFlowUser = [
            'id' => 999,
            'email' => 'newuser@example.com',
            'name' => 'New User',
            'plan' => 'starter',
        ];

        $user = $this->service->findOrCreateUser($triggerFlowUser);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('newuser@example.com', $user->email);
        $this->assertEquals('New User', $user->name);
        $this->assertEquals('999', $user->external_user_id);
        $this->assertEquals('triggerflow', $user->external_source);
        $this->assertEquals('starter', $user->plan);
        $this->assertEquals(50, $user->monthly_quota);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'external_user_id' => '999',
            'external_source' => 'triggerflow',
            'plan' => 'starter',
        ]);
    }

    public function test_find_or_create_user_finds_by_external_id(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'name' => 'Existing User',
            'external_user_id' => '456',
            'external_source' => 'triggerflow',
            'plan' => 'free',
        ]);

        $triggerFlowUser = [
            'id' => 456,
            'email' => 'existing@example.com',
            'name' => 'Updated Name',
            'plan' => 'pro',
        ];

        $user = $this->service->findOrCreateUser($triggerFlowUser);

        $this->assertEquals($existingUser->id, $user->id);
        // Name should be synced
        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('pro', $user->plan);
    }

    public function test_find_or_create_user_finds_by_email(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'matching@example.com',
            'name' => 'Email Match',
            'external_user_id' => null,
            'external_source' => null,
            'plan' => 'free',
        ]);

        $triggerFlowUser = [
            'id' => 789,
            'email' => 'matching@example.com',
            'name' => 'Email Match',
            'plan' => 'starter',
        ];

        $user = $this->service->findOrCreateUser($triggerFlowUser);

        $this->assertEquals($existingUser->id, $user->id);
        // Should now be linked to TriggerFlow
        $user->refresh();
        $this->assertEquals('789', $user->external_user_id);
        $this->assertEquals('triggerflow', $user->external_source);
    }

    /**
     * @dataProvider planMappingProvider
     */
    public function test_maps_plans_correctly(string $triggerFlowPlan, string $expectedReplyStackPlan): void
    {
        $triggerFlowUser = [
            'id' => rand(1000, 9999),
            'email' => "test-{$triggerFlowPlan}@example.com",
            'name' => 'Plan Test',
            'plan' => $triggerFlowPlan,
        ];

        $user = $this->service->findOrCreateUser($triggerFlowUser);

        $this->assertEquals($expectedReplyStackPlan, $user->plan);
    }

    public static function planMappingProvider(): array
    {
        return [
            'free maps to free' => ['free', 'free'],
            'trial maps to free' => ['trial', 'free'],
            'starter maps to starter' => ['starter', 'starter'],
            'basic maps to starter' => ['basic', 'starter'],
            'pro maps to pro' => ['pro', 'pro'],
            'professional maps to pro' => ['professional', 'pro'],
            'business maps to business' => ['business', 'business'],
            'agency maps to business' => ['agency', 'business'],
            'enterprise maps to enterprise' => ['enterprise', 'enterprise'],
            'unknown maps to free' => ['unknown_plan', 'free'],
        ];
    }

    // ========================================
    // invalidateCache() Tests
    // ========================================

    public function test_invalidate_cache_clears_cached_token(): void
    {
        $token = 'token-to-invalidate';
        $cacheKey = 'triggerflow_token:' . hash('sha256', $token);

        Cache::put($cacheKey, ['id' => 1, 'email' => 'test@example.com'], 300);
        $this->assertTrue(Cache::has($cacheKey));

        $this->service->invalidateCache($token);

        $this->assertFalse(Cache::has($cacheKey));
    }
}
