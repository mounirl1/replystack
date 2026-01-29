<?php

namespace App\Services\Admin;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for fetching subscription statistics from Lemon Squeezy API.
 *
 * Provides MRR, ARR, subscription counts, and revenue breakdown by plan.
 * Results are cached for 5 minutes to avoid excessive API calls.
 */
class LemonSqueezyStatsService
{
    private const CACHE_TTL = 300; // 5 minutes
    private const API_BASE_URL = 'https://api.lemonsqueezy.com/v1';

    /**
     * Check if Lemon Squeezy is configured.
     */
    public function isConfigured(): bool
    {
        return !empty(config('services.lemonsqueezy.api_key'))
            && !empty(config('services.lemonsqueezy.store_id'));
    }

    /**
     * Get subscription statistics with caching.
     */
    public function getSubscriptionStats(): array
    {
        if (!$this->isConfigured()) {
            return $this->getEmptyStats();
        }

        return Cache::remember('admin:lemon_subscription_stats', self::CACHE_TTL, function () {
            try {
                $subscriptions = $this->fetchAllSubscriptions();

                return $this->parseSubscriptions($subscriptions);
            } catch (\Exception $e) {
                Log::error('Failed to fetch Lemon Squeezy subscription stats', [
                    'error' => $e->getMessage(),
                ]);

                return $this->getEmptyStats();
            }
        });
    }

    /**
     * Clear the subscription stats cache.
     */
    public function clearCache(): void
    {
        Cache::forget('admin:lemon_subscription_stats');
    }

    /**
     * Fetch all subscriptions from Lemon Squeezy API (paginated).
     */
    private function fetchAllSubscriptions(): Collection
    {
        $allSubscriptions = collect();
        $page = 1;
        $hasMore = true;

        while ($hasMore) {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.lemonsqueezy.api_key'),
                'Accept' => 'application/vnd.api+json',
            ])->get(self::API_BASE_URL . '/subscriptions', [
                'filter[store_id]' => config('services.lemonsqueezy.store_id'),
                'page[number]' => $page,
                'page[size]' => 100,
            ]);

            if (!$response->successful()) {
                Log::warning('Lemon Squeezy API request failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                break;
            }

            $data = $response->json();
            $subscriptions = collect($data['data'] ?? []);
            $allSubscriptions = $allSubscriptions->merge($subscriptions);

            // Check if there are more pages
            $hasMore = !empty($data['links']['next']);
            $page++;

            // Safety limit to prevent infinite loops
            if ($page > 100) {
                break;
            }
        }

        return $allSubscriptions;
    }

    /**
     * Parse subscriptions into statistics.
     */
    private function parseSubscriptions(Collection $subscriptions): array
    {
        // Filter active subscriptions for MRR calculation
        $activeSubscriptions = $subscriptions->filter(function ($sub) {
            $status = $sub['attributes']['status'] ?? '';

            return in_array($status, ['active', 'on_trial']);
        });

        // Calculate MRR from active subscriptions
        $mrr = $activeSubscriptions->sum(function ($sub) {
            return $this->getMonthlyValue($sub);
        });

        // Count by status
        $statusCounts = $subscriptions->groupBy(function ($sub) {
            return $sub['attributes']['status'] ?? 'unknown';
        })->map->count();

        // Get plan breakdown using variant IDs
        $byPlan = $this->getBreakdownByPlan($activeSubscriptions);

        // Calculate churns (cancelled in last 30 days)
        $thirtyDaysAgo = now()->subDays(30)->toIso8601String();
        $recentChurns = $subscriptions->filter(function ($sub) use ($thirtyDaysAgo) {
            $status = $sub['attributes']['status'] ?? '';
            $cancelledAt = $sub['attributes']['cancelled_at'] ?? null;

            return $status === 'cancelled' && $cancelledAt && $cancelledAt >= $thirtyDaysAgo;
        })->count();

        // New subscriptions in last 30 days
        $newSubscriptions = $subscriptions->filter(function ($sub) use ($thirtyDaysAgo) {
            $createdAt = $sub['attributes']['created_at'] ?? null;

            return $createdAt && $createdAt >= $thirtyDaysAgo;
        })->count();

        return [
            'mrr' => round($mrr / 100, 2), // Convert cents to dollars
            'arr' => round(($mrr * 12) / 100, 2),
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $activeSubscriptions->count(),
            'by_status' => $statusCounts->toArray(),
            'by_plan' => $byPlan,
            'new_subscriptions_30d' => $newSubscriptions,
            'churns_30d' => $recentChurns,
            'churn_rate' => $activeSubscriptions->count() > 0
                ? round(($recentChurns / $activeSubscriptions->count()) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get monthly value from a subscription (converts yearly to monthly).
     */
    private function getMonthlyValue(array $subscription): float
    {
        $attributes = $subscription['attributes'] ?? [];

        // Get the price from first_subscription_item
        $price = $attributes['first_subscription_item']['price'] ?? 0;
        $interval = $attributes['billing_anchor'] ?? 1;
        $intervalCount = $attributes['billing_interval_count'] ?? 1;

        // If billing interval is year, divide by 12
        if ($interval === 'year' || $intervalCount === 12) {
            return $price / 12;
        }

        return $price;
    }

    /**
     * Get breakdown by plan using variant IDs.
     */
    private function getBreakdownByPlan(Collection $subscriptions): array
    {
        $variantMapping = [
            config('services.lemonsqueezy.variant_starter_monthly') => 'starter',
            config('services.lemonsqueezy.variant_starter_yearly') => 'starter',
            config('services.lemonsqueezy.variant_pro_monthly') => 'pro',
            config('services.lemonsqueezy.variant_pro_yearly') => 'pro',
            config('services.lemonsqueezy.variant_business_monthly') => 'business',
            config('services.lemonsqueezy.variant_business_yearly') => 'business',
        ];

        $byPlan = [
            'starter' => ['count' => 0, 'mrr' => 0],
            'pro' => ['count' => 0, 'mrr' => 0],
            'business' => ['count' => 0, 'mrr' => 0],
        ];

        foreach ($subscriptions as $sub) {
            $variantId = (string) ($sub['attributes']['variant_id'] ?? '');
            $plan = $variantMapping[$variantId] ?? null;

            if ($plan && isset($byPlan[$plan])) {
                $byPlan[$plan]['count']++;
                $byPlan[$plan]['mrr'] += $this->getMonthlyValue($sub) / 100;
            }
        }

        // Round MRR values
        foreach ($byPlan as &$data) {
            $data['mrr'] = round($data['mrr'], 2);
        }

        return $byPlan;
    }

    /**
     * Get empty stats structure for when API is unavailable.
     */
    private function getEmptyStats(): array
    {
        return [
            'mrr' => 0,
            'arr' => 0,
            'total_subscriptions' => 0,
            'active_subscriptions' => 0,
            'by_status' => [],
            'by_plan' => [
                'starter' => ['count' => 0, 'mrr' => 0],
                'pro' => ['count' => 0, 'mrr' => 0],
                'business' => ['count' => 0, 'mrr' => 0],
            ],
            'new_subscriptions_30d' => 0,
            'churns_30d' => 0,
            'churn_rate' => 0,
            'error' => 'Lemon Squeezy not configured or API unavailable',
        ];
    }
}
