<?php

namespace App\Services\Admin;

use App\Models\Response;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Orchestration service for Super Admin Dashboard.
 *
 * Aggregates metrics from users, responses, AI costs, and revenue.
 * Results are cached to improve performance.
 */
class DashboardService
{
    private const CACHE_TTL = 300; // 5 minutes

    public function __construct(
        private readonly AICostCalculatorService $aiCostCalculator,
        private readonly LemonSqueezyStatsService $lemonSqueezyStats
    ) {}

    /**
     * Get dashboard overview with all key metrics.
     */
    public function getOverview(): array
    {
        return Cache::remember('admin:dashboard_overview', self::CACHE_TTL, function () {
            $userStats = $this->getUserStats();
            $usageStats = $this->getUsageStats();
            $revenueStats = $this->lemonSqueezyStats->getSubscriptionStats();
            $aiCosts = $this->aiCostCalculator->getCostsByPeriod();

            // Calculate margin if we have both revenue and costs
            $marginPercent = null;
            if ($revenueStats['mrr'] > 0 && $aiCosts['estimated_cost_usd'] > 0) {
                // Monthly AI cost estimate (based on current month's usage)
                $monthlyCost = $this->getMonthlyAICost();
                $marginPercent = round((($revenueStats['mrr'] - $monthlyCost) / $revenueStats['mrr']) * 100, 2);
            }

            return [
                'users' => [
                    'total' => $userStats['total'],
                    'active' => $userStats['active_30d'],
                    'new_today' => $userStats['new_today'],
                    'new_this_week' => $userStats['new_this_week'],
                    'new_this_month' => $userStats['new_this_month'],
                ],
                'revenue' => [
                    'mrr' => $revenueStats['mrr'],
                    'arr' => $revenueStats['arr'],
                    'active_subscriptions' => $revenueStats['active_subscriptions'],
                ],
                'ai_costs' => [
                    'total_tokens' => $aiCosts['total_tokens'],
                    'estimated_cost_usd' => $aiCosts['estimated_cost_usd'],
                    'margin_percent' => $marginPercent,
                ],
                'usage' => [
                    'total_responses' => $usageStats['total_responses'],
                    'responses_today' => $usageStats['responses_today'],
                    'responses_this_week' => $usageStats['responses_this_week'],
                    'responses_this_month' => $usageStats['responses_this_month'],
                ],
                'generated_at' => now()->toIso8601String(),
            ];
        });
    }

    /**
     * Get detailed user statistics.
     */
    public function getUserStats(?string $period = null): array
    {
        $cacheKey = 'admin:user_stats_' . ($period ?? 'all');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($period) {
            $total = User::count();

            // Users by plan
            $byPlan = User::selectRaw('plan, COUNT(*) as count')
                ->groupBy('plan')
                ->pluck('count', 'plan')
                ->toArray();

            // Ensure all plans are represented
            $byPlan = array_merge([
                'free' => 0,
                'starter' => 0,
                'pro' => 0,
                'business' => 0,
                'enterprise' => 0,
            ], $byPlan);

            // Active users (generated at least 1 response in last 30 days)
            $active30d = User::whereHas('responses', function ($q) {
                $q->where('created_at', '>=', now()->subDays(30));
            })->count();

            // New users by period
            $newToday = User::where('created_at', '>=', now()->startOfDay())->count();
            $newThisWeek = User::where('created_at', '>=', now()->startOfWeek())->count();
            $newThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();

            // Conversion rate (paid / total)
            $paidUsers = User::whereIn('plan', ['starter', 'pro', 'business', 'enterprise'])->count();
            $conversionRate = $total > 0 ? round(($paidUsers / $total) * 100, 2) : 0;

            // Get trends based on period
            $trends = $this->getUserTrends($period ?? '30d');

            return [
                'total' => $total,
                'by_plan' => $byPlan,
                'by_plan_percent' => $total > 0
                    ? array_map(fn ($count) => round(($count / $total) * 100, 2), $byPlan)
                    : $byPlan,
                'active_30d' => $active30d,
                'new_today' => $newToday,
                'new_this_week' => $newThisWeek,
                'new_this_month' => $newThisMonth,
                'paid_users' => $paidUsers,
                'conversion_rate' => $conversionRate,
                'trends' => $trends,
            ];
        });
    }

    /**
     * Get revenue statistics from Lemon Squeezy.
     */
    public function getRevenueStats(?string $period = null): array
    {
        $stats = $this->lemonSqueezyStats->getSubscriptionStats();

        // Add period-based trends if requested
        // Note: Full historical trends would require storing subscription events
        // For now, we return current snapshot

        return [
            'mrr' => $stats['mrr'],
            'arr' => $stats['arr'],
            'by_plan' => $stats['by_plan'],
            'active_subscriptions' => $stats['active_subscriptions'],
            'new_subscriptions' => $stats['new_subscriptions_30d'],
            'churns' => $stats['churns_30d'],
            'churn_rate' => $stats['churn_rate'],
            'by_status' => $stats['by_status'],
            // Trends would require historical data storage
            'trends' => [],
        ];
    }

    /**
     * Get AI costs statistics.
     */
    public function getAICostsStats(?string $period = null): array
    {
        $periodDays = $this->getPeriodDays($period ?? '30d');
        $from = now()->subDays($periodDays);

        $costs = $this->aiCostCalculator->getCostsByPeriod($from);
        $byProvider = $this->aiCostCalculator->getCostsByProvider($from);
        $topUsers = $this->aiCostCalculator->getTopUsersByTokens(10, $from);
        $trends = $this->aiCostCalculator->getTokenTrends('day', $periodDays);

        // Get revenue for margin calculation
        $revenueStats = $this->lemonSqueezyStats->getSubscriptionStats();
        $monthlyAICost = $this->getMonthlyAICost();
        $marginPercent = $revenueStats['mrr'] > 0
            ? round((($revenueStats['mrr'] - $monthlyAICost) / $revenueStats['mrr']) * 100, 2)
            : null;

        return [
            'total_tokens' => $costs['total_tokens'],
            'by_provider' => $byProvider,
            'estimated_cost_usd' => $costs['estimated_cost_usd'],
            'margin_percent' => $marginPercent,
            'top_users' => $topUsers,
            'trends' => $trends,
            'pricing' => $this->aiCostCalculator->getPricing(),
        ];
    }

    /**
     * Get trends data for multiple metrics.
     */
    public function getTrends(string $period = 'day', int $range = 30): array
    {
        $cacheKey = "admin:trends_{$period}_{$range}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($period, $range) {
            return [
                'registrations' => $this->getRegistrationTrends($period, $range),
                'responses' => $this->getResponseTrends($period, $range),
                'tokens' => $this->aiCostCalculator->getTokenTrends($period, $range),
                'period' => $period,
                'range' => $range,
            ];
        });
    }

    /**
     * Clear all dashboard caches.
     */
    public function clearCache(): void
    {
        Cache::forget('admin:dashboard_overview');
        Cache::forget('admin:user_stats_all');
        Cache::forget('admin:user_stats_7d');
        Cache::forget('admin:user_stats_30d');
        Cache::forget('admin:user_stats_90d');
        Cache::forget('admin:user_stats_12m');
        $this->lemonSqueezyStats->clearCache();
    }

    /**
     * Get usage statistics.
     */
    private function getUsageStats(): array
    {
        return [
            'total_responses' => Response::count(),
            'responses_today' => Response::where('created_at', '>=', now()->startOfDay())->count(),
            'responses_this_week' => Response::where('created_at', '>=', now()->startOfWeek())->count(),
            'responses_this_month' => Response::where('created_at', '>=', now()->startOfMonth())->count(),
        ];
    }

    /**
     * Get user registration trends.
     */
    private function getUserTrends(string $period): array
    {
        $periodDays = $this->getPeriodDays($period);
        $startDate = now()->subDays($periodDays);

        return User::where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(fn ($user) => $this->formatDateForPeriod($user->created_at, $period))
            ->map(fn ($group, $key) => [
                'period' => $key,
                'count' => $group->count(),
            ])
            ->sortBy('period')
            ->values()
            ->toArray();
    }

    /**
     * Get registration trends.
     */
    private function getRegistrationTrends(string $period, int $range): array
    {
        $startDate = match ($period) {
            'week' => now()->subWeeks($range),
            'month' => now()->subMonths($range),
            default => now()->subDays($range),
        };

        return User::where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(fn ($user) => $this->formatDateForPeriod($user->created_at, $period))
            ->map(fn ($group, $key) => [
                'period' => $key,
                'count' => $group->count(),
            ])
            ->sortBy('period')
            ->values()
            ->toArray();
    }

    /**
     * Get response generation trends.
     */
    private function getResponseTrends(string $period, int $range): array
    {
        $startDate = match ($period) {
            'week' => now()->subWeeks($range),
            'month' => now()->subMonths($range),
            default => now()->subDays($range),
        };

        return Response::where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(fn ($response) => $this->formatDateForPeriod($response->created_at, $period))
            ->map(fn ($group, $key) => [
                'period' => $key,
                'count' => $group->count(),
            ])
            ->sortBy('period')
            ->values()
            ->toArray();
    }

    /**
     * Format a date according to the period type.
     */
    private function formatDateForPeriod(Carbon $date, string $period): string
    {
        return match ($period) {
            'week' => $date->format('Y-W'),
            'month' => $date->format('Y-m'),
            default => $date->format('Y-m-d'),
        };
    }

    /**
     * Get estimated monthly AI cost based on current month's usage.
     */
    private function getMonthlyAICost(): float
    {
        $monthStart = now()->startOfMonth();
        $costs = $this->aiCostCalculator->getCostsByPeriod($monthStart);

        return $costs['estimated_cost_usd'];
    }

    /**
     * Convert period string to number of days.
     */
    private function getPeriodDays(string $period): int
    {
        return match ($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '12m' => 365,
            default => 30,
        };
    }

    /**
     * Get MySQL date format for period.
     */
    private function getDateFormat(string $period): string
    {
        return match ($period) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };
    }
}
