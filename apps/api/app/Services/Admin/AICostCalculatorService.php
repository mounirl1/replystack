<?php

namespace App\Services\Admin;

use App\Models\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Service for calculating AI costs based on token usage.
 *
 * Estimates costs using official pricing for each AI provider.
 * Note: These are estimates based on tracked tokens, not actual billing data.
 */
class AICostCalculatorService
{
    /**
     * Default pricing per 1 million tokens (USD).
     * Uses blended rate (weighted average of input/output).
     */
    private const DEFAULT_PRICING = [
        'gemini' => 0.2325,  // Gemini 2.0 Flash: ~$0.075/1M input, ~$0.30/1M output
        'mistral' => 0.25,   // Mistral Small: ~$0.25/1M blended
        'claude' => 0.80,    // Claude Haiku: ~$0.25 input, ~$1.25 output
    ];

    /**
     * Get the cost per million tokens for a provider.
     */
    public function getCostPerMillion(string $provider): float
    {
        return config("services.ai_pricing.{$provider}.cost_per_million_tokens")
            ?? self::DEFAULT_PRICING[$provider]
            ?? 0.25;
    }

    /**
     * Calculate estimated cost for a given number of tokens.
     */
    public function calculateCost(int $tokens, string $provider = 'gemini'): float
    {
        if ($tokens <= 0) {
            return 0.0;
        }

        $costPerMillion = $this->getCostPerMillion($provider);

        return round(($tokens / 1_000_000) * $costPerMillion, 4);
    }

    /**
     * Get total tokens and cost for a period.
     */
    public function getCostsByPeriod(?Carbon $from = null, ?Carbon $to = null): array
    {
        $query = Response::query();

        if ($from) {
            $query->where('created_at', '>=', $from);
        }

        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $totalTokens = (int) $query->sum('tokens_used');

        // For now, assume all responses use Gemini (default provider)
        // TODO: Add provider tracking to Response model for accurate per-provider costs
        $provider = 'gemini';
        $estimatedCost = $this->calculateCost($totalTokens, $provider);

        return [
            'total_tokens' => $totalTokens,
            'estimated_cost_usd' => $estimatedCost,
            'provider' => $provider,
        ];
    }

    /**
     * Get cost breakdown by provider.
     *
     * Note: Currently returns all as Gemini since provider isn't tracked per response.
     */
    public function getCostsByProvider(?Carbon $from = null, ?Carbon $to = null): array
    {
        $query = Response::query();

        if ($from) {
            $query->where('created_at', '>=', $from);
        }

        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $totalTokens = (int) $query->sum('tokens_used');

        // TODO: When provider is tracked per response, group by provider
        return [
            'gemini' => [
                'tokens' => $totalTokens,
                'cost_usd' => $this->calculateCost($totalTokens, 'gemini'),
            ],
            'mistral' => [
                'tokens' => 0,
                'cost_usd' => 0.0,
            ],
        ];
    }

    /**
     * Get top users by token consumption.
     */
    public function getTopUsersByTokens(int $limit = 10, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $query = Response::query()
            ->select('user_id', DB::raw('SUM(tokens_used) as total_tokens'))
            ->groupBy('user_id')
            ->orderByDesc('total_tokens')
            ->limit($limit);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }

        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $results = $query->with('user:id,email,name')->get();

        return $results->map(function ($item) {
            return [
                'user_id' => $item->user_id,
                'email' => $item->user?->email ?? 'Unknown',
                'name' => $item->user?->name ?? 'Unknown',
                'tokens' => (int) $item->total_tokens,
                'estimated_cost_usd' => $this->calculateCost((int) $item->total_tokens, 'gemini'),
            ];
        })->toArray();
    }

    /**
     * Get token usage trends over time.
     */
    public function getTokenTrends(string $period = 'day', int $range = 30): array
    {
        $startDate = match ($period) {
            'week' => now()->subWeeks($range),
            'month' => now()->subMonths($range),
            default => now()->subDays($range),
        };

        $results = Response::where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(fn ($response) => $this->formatDateForPeriod($response->created_at, $period))
            ->map(fn ($group, $key) => [
                'period' => $key,
                'tokens' => $group->sum('tokens_used'),
            ])
            ->sortBy('period')
            ->values();

        return $results->map(function ($item) {
            return [
                'period' => $item['period'],
                'tokens' => (int) $item['tokens'],
                'estimated_cost_usd' => $this->calculateCost((int) $item['tokens'], 'gemini'),
            ];
        })->toArray();
    }

    /**
     * Format a date according to the period type.
     */
    private function formatDateForPeriod(\Carbon\Carbon $date, string $period): string
    {
        return match ($period) {
            'week' => $date->format('Y-W'),
            'month' => $date->format('Y-m'),
            default => $date->format('Y-m-d'),
        };
    }

    /**
     * Get all pricing configuration.
     */
    public function getPricing(): array
    {
        return [
            'gemini' => [
                'cost_per_million_tokens' => $this->getCostPerMillion('gemini'),
                'description' => 'Gemini 2.0 Flash - blended input/output rate',
            ],
            'mistral' => [
                'cost_per_million_tokens' => $this->getCostPerMillion('mistral'),
                'description' => 'Mistral Small - blended rate',
            ],
            'claude' => [
                'cost_per_million_tokens' => $this->getCostPerMillion('claude'),
                'description' => 'Claude Haiku - blended input/output rate',
            ],
        ];
    }
}
