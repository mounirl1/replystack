<?php

namespace App\Services\Quota;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing user quotas.
 *
 * Handles quota checking, decrementing, and scheduled resets.
 */
class QuotaService
{
    /**
     * Plans that have unlimited quota.
     */
    private const UNLIMITED_PLANS = ['pro', 'business', 'enterprise'];

    /**
     * Check if user has remaining quota.
     *
     * @param User $user
     * @return bool
     */
    public function checkQuota(User $user): bool
    {
        return $user->hasQuotaRemaining();
    }

    /**
     * Decrement user's quota after a successful action.
     *
     * @param User $user
     * @return void
     */
    public function decrementQuota(User $user): void
    {
        $user->decrementQuota();
    }

    /**
     * Get complete quota status for a user.
     *
     * @param User $user
     * @return array{
     *     plan: string,
     *     has_quota: bool,
     *     remaining: int|string,
     *     used: int,
     *     limit: int|string,
     *     resets_at: string|null,
     *     is_unlimited: bool
     * }
     */
    public function getQuotaStatus(User $user): array
    {
        $isUnlimited = in_array($user->plan, self::UNLIMITED_PLANS);

        return [
            'plan' => $user->plan,
            'has_quota' => $user->hasQuotaRemaining(),
            'remaining' => $user->quota_remaining,
            'used' => $user->quota_used,
            'limit' => $user->quota_limit,
            'resets_at' => $this->getResetDate($user),
            'is_unlimited' => $isUnlimited,
        ];
    }

    /**
     * Reset monthly quotas for all free and starter plan users.
     *
     * This should be called on the 1st of each month via the scheduler.
     *
     * @return int Number of users reset
     */
    public function resetMonthlyQuotas(): int
    {
        $count = User::query()
            ->whereIn('plan', ['free', 'starter'])
            ->where('quota_used_month', '>', 0)
            ->update([
                'quota_used_month' => 0,
                'quota_reset_at' => Carbon::now(),
            ]);

        Log::info('Monthly quotas reset', ['users_affected' => $count]);

        return $count;
    }

    /**
     * Get quota usage statistics for admin dashboard.
     *
     * @return array{
     *     total_users: int,
     *     by_plan: array<string, int>,
     *     quota_exhausted: int,
     *     average_usage: array<string, float>
     * }
     */
    public function getQuotaStatistics(): array
    {
        $byPlan = User::query()
            ->select('plan', DB::raw('count(*) as count'))
            ->groupBy('plan')
            ->pluck('count', 'plan')
            ->toArray();

        $exhaustedFree = User::query()
            ->where('plan', 'free')
            ->whereColumn('quota_used_month', '>=', 'monthly_quota')
            ->count();

        $exhaustedStarter = User::query()
            ->where('plan', 'starter')
            ->whereColumn('quota_used_month', '>=', 'monthly_quota')
            ->count();

        $avgFreeUsage = User::query()
            ->where('plan', 'free')
            ->where('monthly_quota', '>', 0)
            ->avg(DB::raw('quota_used_month / monthly_quota * 100')) ?? 0;

        $avgStarterUsage = User::query()
            ->where('plan', 'starter')
            ->where('monthly_quota', '>', 0)
            ->avg(DB::raw('quota_used_month / monthly_quota * 100')) ?? 0;

        return [
            'total_users' => array_sum($byPlan),
            'by_plan' => $byPlan,
            'quota_exhausted' => $exhaustedFree + $exhaustedStarter,
            'average_usage' => [
                'free' => round($avgFreeUsage, 2),
                'starter' => round($avgStarterUsage, 2),
            ],
        ];
    }

    /**
     * Upgrade user's quota when they change plans.
     *
     * @param User $user
     * @param string $newPlan
     * @return void
     */
    public function upgradePlan(User $user, string $newPlan): void
    {
        $monthlyQuota = $this->getQuotaConfigForPlan($newPlan);

        $user->update([
            'plan' => $newPlan,
            'monthly_quota' => $monthlyQuota,
            'quota_used_month' => 0,
            'quota_reset_at' => Carbon::now(),
        ]);

        Log::info('User plan upgraded', [
            'user_id' => $user->id,
            'new_plan' => $newPlan,
        ]);
    }

    /**
     * Get monthly quota for a specific plan.
     *
     * @param string $plan
     * @return int Monthly quota (0 means unlimited)
     */
    private function getQuotaConfigForPlan(string $plan): int
    {
        return match ($plan) {
            'free' => 10,
            'starter' => 50,
            'pro', 'business', 'enterprise' => 0,
            default => 0,
        };
    }

    /**
     * Get the quota reset date for a user.
     *
     * @param User $user
     * @return string|null
     */
    private function getResetDate(User $user): ?string
    {
        if (in_array($user->plan, self::UNLIMITED_PLANS)) {
            return null;
        }

        // Free and Starter: reset at start of next month
        return Carbon::now()->addMonth()->startOfMonth()->toIso8601String();
    }
}
