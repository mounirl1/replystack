<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewCollection;
use App\Http\Resources\ReviewResource;
use App\Jobs\FetchReviewsFromApiJob;
use App\Jobs\PublishReplyJob;
use App\Models\Location;
use App\Models\Response;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * List reviews with filters and cursor pagination.
     *
     * GET /api/reviews
     */
    public function index(Request $request): ReviewCollection
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'array'],
            'platform.*' => ['string', Rule::in(['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'g2', 'capterra', 'trustpilot'])],
            'status' => ['nullable', 'array'],
            'status.*' => ['string', Rule::in(['pending', 'replied', 'ignored'])],
            'rating_min' => ['nullable', 'integer', 'between:1,5'],
            'rating_max' => ['nullable', 'integer', 'between:1,5'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        // Get user's location IDs
        $userLocationIds = Location::where('user_id', $user->id)
            ->orWhere('organization_id', $user->organization_id)
            ->pluck('id');

        $query = Review::query()
            ->whereIn('location_id', $userLocationIds)
            ->with(['location:id,name', 'latestResponse'])
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        // Apply filters
        if ($request->filled('location_id')) {
            // Verify user has access to this location
            if (!$userLocationIds->contains($request->location_id)) {
                abort(403, 'You do not have access to this location.');
            }
            $query->where('location_id', $request->location_id);
        }

        if ($request->filled('platform')) {
            $query->whereIn('platform', $request->platform);
        }

        if ($request->filled('status')) {
            $query->whereIn('status', $request->status);
        }

        if ($request->filled('rating_min')) {
            $query->where('rating', '>=', $request->rating_min);
        }

        if ($request->filled('rating_max')) {
            $query->where('rating', '<=', $request->rating_max);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('published_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('published_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $query->where('content', 'like', '%' . $request->search . '%');
        }

        $reviews = $query->cursorPaginate(15);

        return new ReviewCollection($reviews);
    }

    /**
     * Get a single review with full details.
     *
     * GET /api/reviews/{review}
     */
    public function show(Request $request, Review $review): ReviewResource
    {
        $this->authorizeReview($request->user(), $review);

        $review->load([
            'location',
            'responses' => fn($q) => $q->with('user:id,name')->latest(),
        ]);

        return new ReviewResource($review);
    }

    /**
     * Update review status.
     *
     * PATCH /api/reviews/{review}/status
     */
    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $this->authorizeReview($request->user(), $review);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'replied', 'ignored'])],
        ]);

        $updateData = ['status' => $validated['status']];

        // Set replied_at when marking as replied (if not already set)
        if ($validated['status'] === 'replied' && $review->replied_at === null) {
            $updateData['replied_at'] = now();
        }

        $review->update($updateData);

        return response()->json([
            'success' => true,
            'review' => new ReviewResource($review->fresh(['location:id,name', 'latestResponse'])),
        ]);
    }

    /**
     * Get review statistics.
     *
     * GET /api/reviews/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'period' => ['nullable', 'string', Rule::in(['7d', '30d', '90d', 'all'])],
        ]);

        $user = $request->user();
        $locationId = $request->location_id;
        $period = $request->period ?? '30d';

        // Build cache key
        $cacheKey = sprintf(
            'user:%d:reviews:stats:%s',
            $user->id,
            md5(json_encode(['location_id' => $locationId, 'period' => $period]))
        );

        return response()->json(
            Cache::remember($cacheKey, 300, function () use ($user, $locationId, $period) {
                return $this->computeStats($user, $locationId, $period);
            })
        );
    }

    /**
     * Trigger API fetch for reviews.
     *
     * POST /api/reviews/fetch
     */
    public function triggerFetch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'platform' => ['nullable', 'string', Rule::in(['google', 'facebook'])],
        ]);

        $user = $request->user();
        $location = Location::findOrFail($validated['location_id']);

        // Verify ownership
        $this->authorizeLocation($user, $location);

        $platform = $validated['platform'] ?? null;

        // Check if location has valid API connection
        $availablePlatforms = $location->getApiPlatforms();

        if (empty($availablePlatforms)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune connexion API valide pour cet établissement.',
            ], 422);
        }

        if ($platform && !in_array($platform, $availablePlatforms, true)) {
            return response()->json([
                'success' => false,
                'message' => "La connexion {$platform} n'est pas configurée ou a expiré.",
            ], 422);
        }

        // Dispatch job for each platform (or just the specified one)
        $platformsToFetch = $platform ? [$platform] : $availablePlatforms;

        foreach ($platformsToFetch as $p) {
            FetchReviewsFromApiJob::dispatch($location, $p);
        }

        return response()->json([
            'queued' => true,
            'platforms' => $platformsToFetch,
            'message' => 'Récupération des avis en cours...',
        ]);
    }

    /**
     * Publish a reply to a review via API.
     *
     * POST /api/reviews/{review}/publish
     */
    public function publish(Request $request, Review $review): JsonResponse
    {
        $this->authorizeReview($request->user(), $review);

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:10', 'max:4000'],
        ]);

        // Check if platform supports API publishing
        if (!$review->can_publish_via_api) {
            return response()->json([
                'success' => false,
                'message' => "La publication via API n'est pas supportée pour {$review->platform}.",
            ], 422);
        }

        // Check if location has valid token for this platform
        $location = $review->location;
        $isValid = match ($review->platform) {
            'google' => $location->isGoogleTokenValid(),
            'facebook' => $location->isFacebookTokenValid(),
            default => false,
        };

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'La connexion API a expiré. Veuillez vous reconnecter.',
            ], 422);
        }

        // Create response record
        $response = Response::create([
            'review_id' => $review->id,
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'tone' => 'professional', // Default, can be enhanced
            'language' => $review->language ?? 'fr',
            'is_published' => false,
        ]);

        // Dispatch publish job
        PublishReplyJob::dispatch($review, $response);

        return response()->json([
            'queued' => true,
            'response_id' => $response->id,
            'message' => 'Publication en cours...',
        ]);
    }

    /**
     * Compute statistics for reviews.
     */
    protected function computeStats($user, ?int $locationId, string $period): array
    {
        // Get user's location IDs
        $userLocationIds = Location::where('user_id', $user->id)
            ->orWhere('organization_id', $user->organization_id)
            ->pluck('id');

        if ($locationId && !$userLocationIds->contains($locationId)) {
            abort(403, 'You do not have access to this location.');
        }

        $query = Review::query()
            ->whereIn('location_id', $locationId ? [$locationId] : $userLocationIds);

        // Apply period filter
        $dateFrom = match ($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => null,
        };

        if ($dateFrom) {
            $query->where('published_at', '>=', $dateFrom);
        }

        // Basic counts
        $total = $query->count();
        $pending = (clone $query)->pending()->count();
        $replied = (clone $query)->replied()->count();
        $ignored = (clone $query)->ignored()->count();

        // Average rating
        $averageRating = (clone $query)->whereNotNull('rating')->avg('rating');

        // Response rate
        $responseRate = $total > 0 ? round(($replied / $total) * 100, 1) : 0;

        // By platform
        $byPlatform = (clone $query)
            ->select('platform', DB::raw('COUNT(*) as count'))
            ->groupBy('platform')
            ->pluck('count', 'platform')
            ->toArray();

        // By rating
        $byRating = (clone $query)
            ->whereNotNull('rating')
            ->select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Trend (last 30 days, daily)
        $trend = Review::query()
            ->whereIn('location_id', $locationId ? [$locationId] : $userLocationIds)
            ->where('published_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(published_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => (int) $item->count,
            ])
            ->toArray();

        return [
            'total' => $total,
            'pending' => $pending,
            'replied' => $replied,
            'ignored' => $ignored,
            'average_rating' => $averageRating ? round($averageRating, 1) : null,
            'response_rate' => $responseRate,
            'by_platform' => $byPlatform,
            'by_rating' => $byRating,
            'trend' => $trend,
        ];
    }

    /**
     * Verify user has access to the review.
     */
    protected function authorizeReview($user, Review $review): void
    {
        $location = $review->location;
        $this->authorizeLocation($user, $location);
    }

    /**
     * Verify user has access to the location.
     */
    protected function authorizeLocation($user, Location $location): void
    {
        $hasAccess = $location->user_id === $user->id
            || ($location->organization_id && $location->organization_id === $user->organization_id);

        if (!$hasAccess) {
            abort(403, 'You do not have access to this resource.');
        }
    }
}
