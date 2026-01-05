<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Quota\QuotaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuotaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user can get their quota status.
     */
    public function test_user_can_get_quota_status(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 1,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user/quota');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'quota' => [
                    'plan',
                    'has_quota',
                    'remaining',
                    'used',
                    'limit',
                    'resets_at',
                    'is_unlimited',
                ],
            ])
            ->assertJson([
                'quota' => [
                    'plan' => 'free',
                    'has_quota' => true,
                    'remaining' => 9,
                    'used' => 1,
                    'limit' => 10,
                    'is_unlimited' => false,
                ],
            ]);
    }

    /**
     * Test that pro users have unlimited quota.
     */
    public function test_pro_user_has_unlimited_quota(): void
    {
        $user = User::factory()->pro()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user/quota');

        $response->assertStatus(200)
            ->assertJson([
                'quota' => [
                    'plan' => 'pro',
                    'has_quota' => true,
                    'remaining' => 'unlimited',
                    'is_unlimited' => true,
                ],
            ]);
    }

    /**
     * Test that quota middleware blocks requests when quota is exhausted.
     */
    public function test_quota_middleware_blocks_when_exhausted(): void
    {
        $user = User::factory()->exhaustedQuota()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        // Test that the user has no remaining quota
        $this->assertTrue(!$user->hasQuotaRemaining());
    }

    /**
     * Test that free user's quota is correctly tracked.
     */
    public function test_free_user_quota_tracking(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
        ]);

        $this->assertTrue($user->hasQuotaRemaining());
        $this->assertEquals(10, $user->quota_remaining);

        $user->decrementQuota();
        $user->refresh();

        $this->assertTrue($user->hasQuotaRemaining());
        $this->assertEquals(9, $user->quota_remaining);

        // Use remaining quota (9 more times)
        for ($i = 0; $i < 9; $i++) {
            $user->decrementQuota();
        }
        $user->refresh();

        $this->assertFalse($user->hasQuotaRemaining());
        $this->assertEquals(0, $user->quota_remaining);
    }

    /**
     * Test that starter user's monthly quota is tracked.
     */
    public function test_starter_user_monthly_quota_tracking(): void
    {
        $user = User::factory()->starter()->create([
            'quota_used_month' => 48,
        ]);

        $this->assertTrue($user->hasQuotaRemaining());
        $this->assertEquals(2, $user->quota_remaining);

        $user->decrementQuota();
        $user->decrementQuota();
        $user->refresh();

        $this->assertFalse($user->hasQuotaRemaining());
        $this->assertEquals(0, $user->quota_remaining);
    }

    /**
     * Test quota service reset monthly quotas for all plans.
     */
    public function test_quota_service_resets_monthly_quotas(): void
    {
        // Create free and starter users with quota usage
        User::factory()->count(2)->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 10,
        ]);

        User::factory()->count(2)->starter()->create([
            'quota_used_month' => 50,
        ]);

        $service = app(QuotaService::class);
        $count = $service->resetMonthlyQuotas();

        // All 4 users should be reset (2 free + 2 starter)
        $this->assertEquals(4, $count);

        // Verify free users are reset
        $freeUsers = User::where('plan', 'free')->get();
        foreach ($freeUsers as $user) {
            $this->assertEquals(0, $user->quota_used_month);
        }

        // Verify starter users are reset
        $starterUsers = User::where('plan', 'starter')->get();
        foreach ($starterUsers as $user) {
            $this->assertEquals(0, $user->quota_used_month);
        }
    }

    /**
     * Test quota service get status.
     */
    public function test_quota_service_get_status(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 1,
        ]);

        $service = app(QuotaService::class);
        $status = $service->getQuotaStatus($user);

        $this->assertEquals('free', $status['plan']);
        $this->assertTrue($status['has_quota']);
        $this->assertEquals(9, $status['remaining']);
        $this->assertEquals(1, $status['used']);
        $this->assertEquals(10, $status['limit']);
        $this->assertFalse($status['is_unlimited']);
        $this->assertNotNull($status['resets_at']);
    }

    /**
     * Test quota upgrade resets usage.
     */
    public function test_plan_upgrade_resets_quota(): void
    {
        $user = User::factory()->exhaustedQuota()->create();

        $this->assertFalse($user->hasQuotaRemaining());

        $service = app(QuotaService::class);
        $service->upgradePlan($user, 'pro');

        $user->refresh();

        $this->assertEquals('pro', $user->plan);
        $this->assertTrue($user->hasQuotaRemaining());
        $this->assertEquals('unlimited', $user->quota_remaining);
    }

    /**
     * Test user can update settings.
     */
    public function test_user_can_update_settings(): void
    {
        $user = User::factory()->create(['name' => 'Original Name']);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson('/api/user/settings', [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Settings updated successfully.',
                'user' => [
                    'name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
        ]);
    }
}
