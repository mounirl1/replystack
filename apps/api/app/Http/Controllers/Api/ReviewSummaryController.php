<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Review;
use App\Models\ReviewSummary;
use App\Services\AI\ReviewSummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewSummaryController extends Controller
{
    public function __construct(
        private readonly ReviewSummaryService $summaryService
    ) {}

    /**
     * Get existing summary for the given filters.
     *
     * GET /api/reviews/summary
     */
    public function show(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook'])],
            'status' => ['nullable', 'array'],
            'status.*' => ['string', Rule::in(['pending', 'replied', 'ignored'])],
            'rating' => ['nullable', 'array'],
            'rating.*' => ['integer', 'between:1,5'],
            'date_from' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $filters = $this->normalizeFilters($request);

        $summary = ReviewSummary::findForFilters($user->id, $filters);

        return response()->json([
            'summary' => $summary,
        ]);
    }

    /**
     * Generate a new summary for the filtered reviews.
     *
     * POST /api/reviews/summarize
     *
     * Middleware: auth:sanctum, check.quota
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook'])],
            'status' => ['nullable', 'array'],
            'status.*' => ['string', Rule::in(['pending', 'replied', 'ignored'])],
            'rating' => ['nullable', 'array'],
            'rating.*' => ['integer', 'between:1,5'],
            'date_from' => ['nullable', 'date'],
            'language' => ['nullable', 'string', 'max:5'],
        ]);

        $user = $request->user();
        $filters = $this->normalizeFilters($request);

        // Get filtered reviews
        $reviews = $this->getFilteredReviews($user, $filters);

        // Check minimum 5 reviews
        if ($reviews->count() < 5) {
            return response()->json([
                'error' => 'InsufficientReviews',
                'message' => 'Minimum 5 avis requis pour générer un résumé.',
                'review_count' => $reviews->count(),
            ], 422);
        }

        // Generate the summary
        $language = $request->input('language', 'auto');
        $result = $this->summaryService->generate($reviews, $language);

        // Save to database
        $hash = ReviewSummary::generateFiltersHash($filters);
        $summary = ReviewSummary::updateOrCreate(
            ['user_id' => $user->id, 'filters_hash' => $hash],
            [
                'location_id' => $filters['location_id'] ?? null,
                'filters' => $filters,
                'summary' => $result['summary'],
                'strengths' => $result['strengths'],
                'improvements' => $result['improvements'],
                'keywords' => $result['keywords'],
                'review_count' => $reviews->count(),
                'tokens_used' => $result['tokens_used'],
            ]
        );

        // Decrement user quota
        $user->decrementQuota();

        return response()->json([
            'summary' => $summary,
            'quota_remaining' => $user->fresh()->quota_remaining,
        ]);
    }

    /**
     * Normalize request filters into a consistent array.
     */
    private function normalizeFilters(Request $request): array
    {
        $filters = [];

        if ($request->filled('location_id')) {
            $filters['location_id'] = (int) $request->location_id;
        }

        if ($request->filled('platform')) {
            $platforms = $request->platform;
            sort($platforms);
            $filters['platform'] = $platforms;
        }

        if ($request->filled('status')) {
            $statuses = $request->status;
            sort($statuses);
            $filters['status'] = $statuses;
        }

        if ($request->filled('rating')) {
            $ratings = array_map('intval', $request->rating);
            sort($ratings);
            $filters['rating'] = $ratings;
        }

        if ($request->filled('date_from')) {
            $filters['date_from'] = $request->date_from;
        }

        return $filters;
    }

    /**
     * Get filtered reviews for the user.
     */
    private function getFilteredReviews($user, array $filters)
    {
        // Get user's location IDs
        $userLocationIds = Location::where('user_id', $user->id)
            ->orWhere('organization_id', $user->organization_id)
            ->pluck('id');

        $query = Review::query()
            ->whereIn('location_id', $userLocationIds)
            ->whereNotNull('content')
            ->where('content', '!=', '');

        // Apply filters
        if (!empty($filters['location_id'])) {
            // Verify user has access to this location
            if (!$userLocationIds->contains($filters['location_id'])) {
                abort(403, 'You do not have access to this location.');
            }
            $query->where('location_id', $filters['location_id']);
        }

        if (!empty($filters['platform'])) {
            $query->whereIn('platform', $filters['platform']);
        }

        if (!empty($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        if (!empty($filters['rating'])) {
            $query->whereIn('rating', $filters['rating']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('published_at', '>=', $filters['date_from']);
        }

        // Order by most recent and limit to prevent huge prompts
        return $query->orderByDesc('published_at')
            ->limit(50) // Limit to 50 most recent reviews for summary
            ->get();
    }
}
