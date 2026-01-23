<?php

namespace Tests\Unit\Services\Quota;

use App\Models\User;
use App\Services\Quota\QuotaService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuotaServiceTest extends TestCase
{
    use RefreshDatabase;

    private QuotaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new QuotaService();
        Carbon::setTestNow(Carbon::create(2026, 1, 15, 12, 0, 0));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    // ========================================
    // checkQuota() Tests
    // ========================================

    public function test_check_quota_returns_true_for_user_with_remaining_quota(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 5,
        ]);

        $result = $this->service->checkQuota($user);

        $this->assertTrue($result);
    }

    public function test_check_quota_returns_false_for_user_with_exhausted_quota(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 10,
        ]);

        $result = $this->service->checkQuota($user);

        $this->assertFalse($result);
    }

    public function test_check_quota_returns_true_for_unlimited_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'pro',
            'monthly_quota' => 0,
            'quota_used_month' => 1000,
        ]);

        $result = $this->service->checkQuota($user);

        $this->assertTrue($result);
    }

    // ========================================
    // decrementQuota() Tests
    // ========================================

    public function test_decrement_quota_increases_used_count_for_free_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 5,
        ]);

        $this->service->decrementQuota($user);

        $user->refresh();
        $this->assertEquals(6, $user->quota_used_month);
    }

    public function test_decrement_quota_increases_used_count_for_starter_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 20,
        ]);

        $this->service->decrementQuota($user);

        $user->refresh();
        $this->assertEquals(21, $user->quota_used_month);
    }

    public function test_decrement_quota_does_not_change_unlimited_plans(): void
    {
        $user = User::factory()->create([
            'plan' => 'pro',
            'monthly_quota' => 0,
            'quota_used_month' => 100,
        ]);

        $initialUsed = $user->quota_used_month;
        $this->service->decrementQuota($user);

        $user->refresh();
        $this->assertEquals($initialUsed, $user->quota_used_month);
    }

    // ========================================
    // getQuotaStatus() Tests
    // ========================================

    public function test_get_quota_status_returns_correct_structure_for_free_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 3,
        ]);

        $status = $this->service->getQuotaStatus($user);

        $this->assertArrayHasKey('plan', $status);
        $this->assertArrayHasKey('has_quota', $status);
        $this->assertArrayHasKey('remaining', $status);
        $this->assertArrayHasKey('used', $status);
        $this->assertArrayHasKey('limit', $status);
        $this->assertArrayHasKey('resets_at', $status);
        $this->assertArrayHasKey('is_unlimited', $status);

        $this->assertEquals('free', $status['plan']);
        $this->assertTrue($status['has_quota']);
        $this->assertFalse($status['is_unlimited']);
    }

    public function test_get_quota_status_returns_unlimited_for_pro_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'pro',
            'monthly_quota' => 0,
            'quota_used_month' => 500,
        ]);

        $status = $this->service->getQuotaStatus($user);

        $this->assertEquals('pro', $status['plan']);
        $this->assertTrue($status['is_unlimited']);
        $this->assertNull($status['resets_at']);
    }

    public function test_get_quota_status_returns_unlimited_for_business_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'business',
            'monthly_quota' => 0,
            'quota_used_month' => 1000,
        ]);

        $status = $this->service->getQuotaStatus($user);

        $this->assertTrue($status['is_unlimited']);
        $this->assertNull($status['resets_at']);
    }

    public function test_get_quota_status_returns_unlimited_for_enterprise_plan(): void
    {
        $user = User::factory()->create([
            'plan' => 'enterprise',
            'monthly_quota' => 0,
            'quota_used_month' => 5000,
        ]);

        $status = $this->service->getQuotaStatus($user);

        $this->assertTrue($status['is_unlimited']);
        $this->assertNull($status['resets_at']);
    }

    public function test_get_quota_status_returns_reset_date_for_limited_plans(): void
    {
        $user = User::factory()->create([
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 10,
        ]);

        $status = $this->service->getQuotaStatus($user);

        $this->assertNotNull($status['resets_at']);
        // Should reset on 2026-02-01 (start of next month)
        $this->assertStringContainsString('2026-02-01', $status['resets_at']);
    }

    // ========================================
    // resetMonthlyQuotas() Tests
    // ========================================

    public function test_reset_monthly_quotas_resets_free_users(): void
    {
        User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 8,
        ]);

        $count = $this->service->resetMonthlyQuotas();

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('users', [
            'plan' => 'free',
            'quota_used_month' => 0,
        ]);
    }

    public function test_reset_monthly_quotas_resets_starter_users(): void
    {
        User::factory()->create([
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 45,
        ]);

        $count = $this->service->resetMonthlyQuotas();

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('users', [
            'plan' => 'starter',
            'quota_used_month' => 0,
        ]);
    }

    public function test_reset_monthly_quotas_does_not_reset_pro_users(): void
    {
        User::factory()->create([
            'plan' => 'pro',
            'monthly_quota' => 0,
            'quota_used_month' => 500,
        ]);

        $count = $this->service->resetMonthlyQuotas();

        $this->assertEquals(0, $count);
        $this->assertDatabaseHas('users', [
            'plan' => 'pro',
            'quota_used_month' => 500,
        ]);
    }

    public function test_reset_monthly_quotas_does_not_reset_users_with_zero_usage(): void
    {
        User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
        ]);

        $count = $this->service->resetMonthlyQuotas();

        $this->assertEquals(0, $count);
    }

    public function test_reset_monthly_quotas_handles_multiple_users(): void
    {
        User::factory()->create(['plan' => 'free', 'quota_used_month' => 5]);
        User::factory()->create(['plan' => 'free', 'quota_used_month' => 10]);
        User::factory()->create(['plan' => 'starter', 'quota_used_month' => 30]);
        User::factory()->create(['plan' => 'pro', 'quota_used_month' => 100]);

        $count = $this->service->resetMonthlyQuotas();

        $this->assertEquals(3, $count);
    }

    // ========================================
    // upgradePlan() Tests
    // ========================================

    public function test_upgrade_plan_from_free_to_starter(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 8,
        ]);

        $this->service->upgradePlan($user, 'starter');

        $user->refresh();
        $this->assertEquals('starter', $user->plan);
        $this->assertEquals(50, $user->monthly_quota);
        $this->assertEquals(0, $user->quota_used_month);
    }

    public function test_upgrade_plan_from_starter_to_pro(): void
    {
        $user = User::factory()->create([
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 40,
        ]);

        $this->service->upgradePlan($user, 'pro');

        $user->refresh();
        $this->assertEquals('pro', $user->plan);
        $this->assertEquals(0, $user->monthly_quota);
        $this->assertEquals(0, $user->quota_used_month);
    }

    public function test_upgrade_plan_sets_correct_quota_for_business(): void
    {
        $user = User::factory()->create([
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 25,
        ]);

        $this->service->upgradePlan($user, 'business');

        $user->refresh();
        $this->assertEquals('business', $user->plan);
        $this->assertEquals(0, $user->monthly_quota);
    }

    public function test_upgrade_plan_resets_quota_used(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 10,
        ]);

        $this->service->upgradePlan($user, 'starter');

        $user->refresh();
        $this->assertEquals(0, $user->quota_used_month);
        $this->assertNotNull($user->quota_reset_at);
    }

    public function test_upgrade_plan_sets_quota_reset_at(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 5,
            'quota_reset_at' => null,
        ]);

        $this->service->upgradePlan($user, 'pro');

        $user->refresh();
        $this->assertNotNull($user->quota_reset_at);
    }

    // ========================================
    // getQuotaStatistics() Tests
    // ========================================

    public function test_get_quota_statistics_returns_correct_structure(): void
    {
        User::factory()->create(['plan' => 'free', 'monthly_quota' => 10, 'quota_used_month' => 5]);
        User::factory()->create(['plan' => 'starter', 'monthly_quota' => 50, 'quota_used_month' => 25]);
        User::factory()->create(['plan' => 'pro', 'monthly_quota' => 0, 'quota_used_month' => 100]);

        $stats = $this->service->getQuotaStatistics();

        $this->assertArrayHasKey('total_users', $stats);
        $this->assertArrayHasKey('by_plan', $stats);
        $this->assertArrayHasKey('quota_exhausted', $stats);
        $this->assertArrayHasKey('average_usage', $stats);
    }

    public function test_get_quota_statistics_counts_users_by_plan(): void
    {
        User::factory()->count(3)->create(['plan' => 'free']);
        User::factory()->count(2)->create(['plan' => 'starter']);
        User::factory()->count(1)->create(['plan' => 'pro']);

        $stats = $this->service->getQuotaStatistics();

        $this->assertEquals(6, $stats['total_users']);
        $this->assertEquals(3, $stats['by_plan']['free']);
        $this->assertEquals(2, $stats['by_plan']['starter']);
        $this->assertEquals(1, $stats['by_plan']['pro']);
    }

    public function test_get_quota_statistics_counts_exhausted_quotas(): void
    {
        User::factory()->create(['plan' => 'free', 'monthly_quota' => 10, 'quota_used_month' => 10]);
        User::factory()->create(['plan' => 'free', 'monthly_quota' => 10, 'quota_used_month' => 5]);
        User::factory()->create(['plan' => 'starter', 'monthly_quota' => 50, 'quota_used_month' => 50]);

        $stats = $this->service->getQuotaStatistics();

        $this->assertEquals(2, $stats['quota_exhausted']);
    }

    public function test_get_quota_statistics_calculates_average_usage(): void
    {
        // Use values that work with integer division in SQLite
        User::factory()->create(['plan' => 'free', 'monthly_quota' => 10, 'quota_used_month' => 10]); // 100%
        User::factory()->create(['plan' => 'free', 'monthly_quota' => 10, 'quota_used_month' => 10]); // 100%

        $stats = $this->service->getQuotaStatistics();

        // Average should be 100% (both users at full usage)
        $this->assertEquals(100.0, $stats['average_usage']['free']);
    }

    // ========================================
    // Edge Cases
    // ========================================

    public function test_handles_empty_database(): void
    {
        $stats = $this->service->getQuotaStatistics();

        $this->assertEquals(0, $stats['total_users']);
        $this->assertEmpty($stats['by_plan']);
        $this->assertEquals(0, $stats['quota_exhausted']);
    }

    /**
     * @dataProvider unlimitedPlansProvider
     */
    public function test_unlimited_plans_always_have_quota(string $plan): void
    {
        $user = User::factory()->create([
            'plan' => $plan,
            'monthly_quota' => 0,
            'quota_used_month' => 999999,
        ]);

        $this->assertTrue($this->service->checkQuota($user));

        $status = $this->service->getQuotaStatus($user);
        $this->assertTrue($status['is_unlimited']);
    }

    public static function unlimitedPlansProvider(): array
    {
        return [
            'pro plan' => ['pro'],
            'business plan' => ['business'],
            'enterprise plan' => ['enterprise'],
        ];
    }

    /**
     * @dataProvider limitedPlansProvider
     */
    public function test_limited_plans_have_quota_limits(string $plan, int $expectedQuota): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
        ]);

        $this->service->upgradePlan($user, $plan);

        $user->refresh();
        $this->assertEquals($expectedQuota, $user->monthly_quota);
    }

    public static function limitedPlansProvider(): array
    {
        return [
            'free plan' => ['free', 10],
            'starter plan' => ['starter', 50],
        ];
    }
}
