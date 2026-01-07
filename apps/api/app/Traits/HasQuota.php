<?php

namespace App\Traits;

use Carbon\Carbon;

/**
 * Trait HasQuota
 *
 * Provides quota management functionality for users.
 * Handles monthly quotas for free and starter plans.
 * Pro, Business, and Enterprise plans have unlimited quotas.
 *
 * @package App\Traits
 */
trait HasQuota
{
    /**
     * Plans that have unlimited quota.
     */
    protected static array $unlimitedPlans = ['pro', 'business', 'enterprise'];

    /**
     * Check if the user has remaining quota for generating replies.
     *
     * @return bool True if user can generate more replies, false otherwise
     */
    public function hasQuotaRemaining(): bool
    {
        // Unlimited plans always have quota
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return true;
        }

        // Free and Starter plans: monthly quota
        $this->checkAndResetMonthlyQuota();
        return $this->quota_used_month < $this->monthly_quota;
    }

    /**
     * Get the remaining quota for the user.
     *
     * @return int|string Number of remaining replies or 'unlimited'
     */
    public function getQuotaRemainingAttribute(): int|string
    {
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return 'unlimited';
        }

        // Free and Starter: monthly quota
        $this->checkAndResetMonthlyQuota();
        return max(0, $this->monthly_quota - $this->quota_used_month);
    }

    /**
     * Get the quota limit for the current plan.
     *
     * @return int|string The quota limit or 'unlimited'
     */
    public function getQuotaLimitAttribute(): int|string
    {
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return 'unlimited';
        }

        return $this->monthly_quota;
    }

    /**
     * Get the quota used for the current period.
     *
     * @return int Number of replies used in current period
     */
    public function getQuotaUsedAttribute(): int
    {
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return 0;
        }

        return $this->quota_used_month;
    }

    /**
     * Decrement the user's quota after generating a reply.
     *
     * @return void
     */
    public function decrementQuota(): void
    {
        // Unlimited plans don't need quota tracking
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return;
        }

        // Free and Starter plans use monthly quota
        $this->increment('quota_used_month');
    }

    /**
     * Check and reset monthly quota if a new month has started.
     *
     * @return void
     */
    public function checkAndResetMonthlyQuota(): void
    {
        $now = Carbon::now();

        // If no reset date set, or it's a new month, reset the quota
        if (
            $this->quota_reset_at === null ||
            $now->startOfMonth()->gt(Carbon::parse($this->quota_reset_at)->startOfMonth())
        ) {
            $this->resetMonthlyQuota();
        }
    }

    /**
     * Reset the monthly quota counter.
     *
     * @return void
     */
    public function resetMonthlyQuota(): void
    {
        $this->update([
            'quota_used_month' => 0,
            'quota_reset_at' => Carbon::now(),
        ]);
    }

    /**
     * Get quota information as an array.
     *
     * @return array{plan: string, quota_remaining: int|string, quota_used: int, quota_limit: int|string, resets_at: string|null}
     */
    public function getQuotaInfo(): array
    {
        return [
            'plan' => $this->plan,
            'quota_remaining' => $this->quota_remaining,
            'quota_used' => $this->quota_used,
            'quota_limit' => $this->quota_limit,
            'resets_at' => $this->getQuotaResetDate(),
        ];
    }

    /**
     * Get the next quota reset date.
     *
     * @return string|null ISO 8601 formatted date or null for unlimited plans
     */
    protected function getQuotaResetDate(): ?string
    {
        if (in_array($this->plan, self::$unlimitedPlans)) {
            return null;
        }

        // Free and Starter: reset at start of next month
        return Carbon::now()->addMonth()->startOfMonth()->toIso8601String();
    }

    /**
     * Set the quota limits based on plan.
     * Called when user's plan changes.
     *
     * @param string $plan The new plan
     * @return void
     */
    public function setQuotaForPlan(string $plan): void
    {
        $quotas = [
            'free' => ['monthly_quota' => 10],
            'starter' => ['monthly_quota' => 50],
            'pro' => ['monthly_quota' => 0],
            'business' => ['monthly_quota' => 0],
            'enterprise' => ['monthly_quota' => 0],
        ];

        $this->update([
            'plan' => $plan,
            'monthly_quota' => $quotas[$plan]['monthly_quota'],
            'quota_used_month' => 0,
            'quota_reset_at' => Carbon::now(),
        ]);
    }
}
