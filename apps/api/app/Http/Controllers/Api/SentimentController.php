<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SentimentController extends Controller
{
    /**
     * Cache duration in seconds (15 minutes).
     */
    private const CACHE_TTL = 900;

    /**
     * Valid sentiment themes for filtering.
     */
    private const VALID_THEMES = [
        'service',
        'cleanliness',
        'price',
        'quality',
        'welcome',
        'location',
        'ambiance',
        'food',
        'staff',
        'comfort',
    ];

    /**
     * Get sentiment summary with global score and distribution.
     *
     * GET /api/reviews/sentiment/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'airbnb'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $cacheKey = $this->buildCacheKey('summary', $user->id, $request->all());

        return response()->json(
            Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request, $user) {
                return $this->computeSummary($user, $request);
            })
        );
    }

    /**
     * Get sentiment trends over time.
     *
     * GET /api/reviews/sentiment/trends
     */
    public function trends(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'airbnb'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'granularity' => ['nullable', 'string', Rule::in(['day', 'week', 'month'])],
        ]);

        $user = $request->user();
        $cacheKey = $this->buildCacheKey('trends', $user->id, $request->all());

        return response()->json(
            Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request, $user) {
                return $this->computeTrends($user, $request);
            })
        );
    }

    /**
     * Get recurring themes with counts.
     *
     * GET /api/reviews/sentiment/themes
     */
    public function themes(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'airbnb'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sentiment' => ['nullable', 'string', Rule::in(['positive', 'negative', 'neutral'])],
        ]);

        $user = $request->user();
        $cacheKey = $this->buildCacheKey('themes', $user->id, $request->all());

        return response()->json(
            Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request, $user) {
                return $this->computeThemes($user, $request);
            })
        );
    }

    /**
     * Compute sentiment summary data.
     */
    protected function computeSummary($user, Request $request): array
    {
        $query = $this->buildBaseQuery($user, $request);

        // Only include reviews that have been analyzed
        $query->withSentiment();

        $total = $query->count();

        if ($total === 0) {
            return [
                'total_analyzed' => 0,
                'average_score' => null,
                'distribution' => [
                    'positive' => 0,
                    'neutral' => 0,
                    'negative' => 0,
                ],
                'distribution_percentages' => [
                    'positive' => 0,
                    'neutral' => 0,
                    'negative' => 0,
                ],
                'score_change' => null,
                'period' => $this->getPeriodInfo($request),
            ];
        }

        // Average sentiment score
        $averageScore = (clone $query)->avg('sentiment_score');

        // Distribution by label
        $distribution = (clone $query)
            ->select('sentiment_label', DB::raw('COUNT(*) as count'))
            ->groupBy('sentiment_label')
            ->pluck('count', 'sentiment_label')
            ->toArray();

        $positive = $distribution['positive'] ?? 0;
        $neutral = $distribution['neutral'] ?? 0;
        $negative = $distribution['negative'] ?? 0;

        // Calculate percentages
        $distributionPercentages = [
            'positive' => $total > 0 ? round(($positive / $total) * 100, 1) : 0,
            'neutral' => $total > 0 ? round(($neutral / $total) * 100, 1) : 0,
            'negative' => $total > 0 ? round(($negative / $total) * 100, 1) : 0,
        ];

        // Calculate score change compared to previous period
        $scoreChange = $this->computeScoreChange($user, $request);

        return [
            'total_analyzed' => $total,
            'average_score' => round($averageScore, 2),
            'distribution' => [
                'positive' => $positive,
                'neutral' => $neutral,
                'negative' => $negative,
            ],
            'distribution_percentages' => $distributionPercentages,
            'score_change' => $scoreChange,
            'period' => $this->getPeriodInfo($request),
        ];
    }

    /**
     * Compute sentiment trends over time.
     */
    protected function computeTrends($user, Request $request): array
    {
        $query = $this->buildBaseQuery($user, $request);
        $query->withSentiment();

        $granularity = $request->input('granularity', 'day');

        // Determine date select format based on database driver
        $driver = DB::getDriverName();
        $dateSelectFormat = $this->getDateSelectFormat($granularity, $driver);

        // Get trends data
        $trends = (clone $query)
            ->select(
                DB::raw("{$dateSelectFormat} as period"),
                DB::raw('AVG(sentiment_score) as avg_score'),
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN sentiment_label = 'positive' THEN 1 ELSE 0 END) as positive_count"),
                DB::raw("SUM(CASE WHEN sentiment_label = 'neutral' THEN 1 ELSE 0 END) as neutral_count"),
                DB::raw("SUM(CASE WHEN sentiment_label = 'negative' THEN 1 ELSE 0 END) as negative_count")
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'avg_score' => round((float) $item->avg_score, 2),
                    'count' => (int) $item->count,
                    'distribution' => [
                        'positive' => (int) $item->positive_count,
                        'neutral' => (int) $item->neutral_count,
                        'negative' => (int) $item->negative_count,
                    ],
                ];
            })
            ->toArray();

        return [
            'granularity' => $granularity,
            'data' => $trends,
            'period' => $this->getPeriodInfo($request),
        ];
    }

    /**
     * Get database-specific date format for grouping.
     */
    protected function getDateSelectFormat(string $granularity, string $driver): string
    {
        if ($driver === 'sqlite') {
            return match ($granularity) {
                'week' => "strftime('%Y-%W', published_at)",
                'month' => "strftime('%Y-%m', published_at)",
                default => "date(published_at)",
            };
        }

        // MySQL / MariaDB
        return match ($granularity) {
            'week' => "DATE_FORMAT(published_at, '%Y-%u')",
            'month' => "DATE_FORMAT(published_at, '%Y-%m')",
            default => 'DATE(published_at)',
        };
    }

    /**
     * Compute theme statistics.
     */
    protected function computeThemes($user, Request $request): array
    {
        $query = $this->buildBaseQuery($user, $request);
        $query->withSentiment();

        // Filter by sentiment if provided
        if ($request->filled('sentiment')) {
            $query->where('sentiment_label', $request->sentiment);
        }

        // Get all reviews with their themes
        $reviews = $query->whereNotNull('sentiment_themes')
            ->select('sentiment_themes', 'sentiment_label', 'sentiment_score')
            ->get();

        // Count themes
        $themeStats = [];
        foreach (self::VALID_THEMES as $theme) {
            $themeStats[$theme] = [
                'count' => 0,
                'positive_count' => 0,
                'neutral_count' => 0,
                'negative_count' => 0,
                'avg_score' => 0,
                'scores' => [],
            ];
        }

        foreach ($reviews as $review) {
            $themes = $review->sentiment_themes;
            if (!is_array($themes)) {
                continue;
            }

            foreach ($themes as $theme) {
                if (!isset($themeStats[$theme])) {
                    continue;
                }

                $themeStats[$theme]['count']++;
                $themeStats[$theme]['scores'][] = $review->sentiment_score;

                match ($review->sentiment_label) {
                    'positive' => $themeStats[$theme]['positive_count']++,
                    'neutral' => $themeStats[$theme]['neutral_count']++,
                    'negative' => $themeStats[$theme]['negative_count']++,
                    default => null,
                };
            }
        }

        // Calculate averages and format output
        $themesResult = [];
        foreach ($themeStats as $theme => $stats) {
            if ($stats['count'] === 0) {
                continue;
            }

            $avgScore = count($stats['scores']) > 0
                ? array_sum($stats['scores']) / count($stats['scores'])
                : 0;

            $themesResult[] = [
                'theme' => $theme,
                'count' => $stats['count'],
                'avg_score' => round($avgScore, 2),
                'sentiment_breakdown' => [
                    'positive' => $stats['positive_count'],
                    'neutral' => $stats['neutral_count'],
                    'negative' => $stats['negative_count'],
                ],
            ];
        }

        // Sort by count descending
        usort($themesResult, fn($a, $b) => $b['count'] - $a['count']);

        return [
            'themes' => $themesResult,
            'total_reviews' => $reviews->count(),
            'period' => $this->getPeriodInfo($request),
        ];
    }

    /**
     * Build base query with user location filtering.
     */
    protected function buildBaseQuery($user, Request $request)
    {
        // Get user's location IDs
        $userLocationIds = Location::where('user_id', $user->id)
            ->when($user->organization_id, function ($q) use ($user) {
                $q->orWhere('organization_id', $user->organization_id);
            })
            ->pluck('id');

        $query = Review::query()
            ->whereIn('location_id', $userLocationIds);

        // Apply location filter
        if ($request->filled('location_id')) {
            if (!$userLocationIds->contains($request->location_id)) {
                abort(403, 'You do not have access to this location.');
            }
            $query->where('location_id', $request->location_id);
        }

        // Apply platform filter
        if ($request->filled('platform')) {
            $query->whereIn('platform', $request->platform);
        }

        // Apply date filters
        if ($request->filled('date_from')) {
            $query->whereDate('published_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('published_at', '<=', $request->date_to);
        }

        return $query;
    }

    /**
     * Compute score change compared to previous period.
     */
    protected function computeScoreChange($user, Request $request): ?array
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        if (!$dateFrom && !$dateTo) {
            // Default: compare last 30 days to previous 30 days
            $currentFrom = now()->subDays(30);
            $currentTo = now();
            $previousFrom = now()->subDays(60);
            $previousTo = now()->subDays(30);
        } elseif ($dateFrom && $dateTo) {
            // Calculate period length and get previous period
            $periodStart = \Carbon\Carbon::parse($dateFrom);
            $periodEnd = \Carbon\Carbon::parse($dateTo);
            $periodLength = $periodStart->diffInDays($periodEnd);

            $currentFrom = $periodStart;
            $currentTo = $periodEnd;
            $previousFrom = $periodStart->copy()->subDays($periodLength + 1);
            $previousTo = $periodStart->copy()->subDay();
        } else {
            return null;
        }

        // Get user's location IDs
        $userLocationIds = Location::where('user_id', $user->id)
            ->when($user->organization_id, function ($q) use ($user) {
                $q->orWhere('organization_id', $user->organization_id);
            })
            ->pluck('id');

        $baseQuery = Review::query()
            ->whereIn('location_id', $userLocationIds)
            ->withSentiment();

        if ($request->filled('location_id')) {
            $baseQuery->where('location_id', $request->location_id);
        }

        if ($request->filled('platform')) {
            $baseQuery->whereIn('platform', $request->platform);
        }

        // Current period average
        $currentAvg = (clone $baseQuery)
            ->whereBetween('published_at', [$currentFrom, $currentTo])
            ->avg('sentiment_score');

        // Previous period average
        $previousAvg = (clone $baseQuery)
            ->whereBetween('published_at', [$previousFrom, $previousTo])
            ->avg('sentiment_score');

        if ($currentAvg === null || $previousAvg === null) {
            return null;
        }

        $change = $currentAvg - $previousAvg;
        $changePercent = $previousAvg > 0
            ? (($currentAvg - $previousAvg) / $previousAvg) * 100
            : 0;

        return [
            'absolute' => round($change, 2),
            'percent' => round($changePercent, 1),
            'direction' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
        ];
    }

    /**
     * Get period info for response.
     */
    protected function getPeriodInfo(Request $request): array
    {
        return [
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
            'location_id' => $request->input('location_id'),
            'platforms' => $request->input('platform'),
        ];
    }

    /**
     * Build cache key for the request.
     */
    protected function buildCacheKey(string $type, int $userId, array $params): string
    {
        return sprintf(
            'user:%d:sentiment:%s:%s',
            $userId,
            $type,
            md5(json_encode($params))
        );
    }
}
