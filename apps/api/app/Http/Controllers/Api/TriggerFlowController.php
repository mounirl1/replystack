<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Review;
use App\Models\ReviewConnection;
use App\Models\User;
use App\Services\AI\ReplyGeneratorService;
use App\Services\Apify\ApifyService;
use App\Services\Google\GoogleBusinessAuthService;
use App\Services\Google\GoogleBusinessReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * TriggerFlowController
 *
 * Handles API endpoints for TriggerFlow integration.
 * All routes are protected by the ValidateTriggerFlowToken middleware.
 */
class TriggerFlowController extends Controller
{
    public function __construct(
        private readonly ReplyGeneratorService $replyGenerator,
        private readonly GoogleBusinessAuthService $googleAuthService,
        private readonly GoogleBusinessReviewService $googleReviewService
    ) {}

    // ==================== LOCATION MANAGEMENT ====================

    /**
     * Sync a location from TriggerFlow (create or update).
     *
     * POST /api/triggerflow/locations/sync
     */
    public function syncLocation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'external_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'default_tone' => 'nullable|string|in:professional,friendly,formal,casual',
            'default_language' => 'nullable|string|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        $location = Location::byExternalId($validated['external_id'], 'triggerflow')
            ->where('user_id', $user->id)
            ->first();

        if ($location) {
            $location->update([
                'name' => $validated['name'],
                'address' => $validated['address'] ?? $location->address,
                'default_tone' => $validated['default_tone'] ?? $location->default_tone,
                'default_language' => $validated['default_language'] ?? $location->default_language,
            ]);
        } else {
            $location = Location::create([
                'user_id' => $user->id,
                'external_facility_id' => $validated['external_id'],
                'external_source' => 'triggerflow',
                'name' => $validated['name'],
                'address' => $validated['address'] ?? null,
                'default_tone' => $validated['default_tone'] ?? 'professional',
                'default_language' => $validated['default_language'] ?? 'auto',
            ]);
        }

        return response()->json([
            'message' => 'Location synced successfully',
            'location' => $location,
        ]);
    }

    /**
     * Delete a location by external ID.
     *
     * DELETE /api/triggerflow/locations/{externalId}
     */
    public function deleteLocation(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = Location::byExternalId($externalId, 'triggerflow')
            ->where('user_id', $user->id)
            ->first();

        if (!$location) {
            return response()->json([
                'message' => 'Location not found',
            ], 404);
        }

        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully',
        ]);
    }

    // ==================== REVIEWS ====================

    /**
     * Get reviews for a location with advanced filtering.
     *
     * GET /api/triggerflow/locations/{externalId}/reviews
     */
    public function getReviews(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $query = Review::where('location_id', $location->id)
            ->with('reviewConnection:id,platform,label,platform_url');

        // Multi-location filter (for groups)
        if ($request->has('filter_location_ids')) {
            $locationIds = $this->getUserLocationIds($user, $request->input('filter_location_ids'));
            $query = Review::whereIn('location_id', $locationIds)
                ->with('reviewConnection:id,platform,label,platform_url');
        }

        // Platform filters
        if ($request->has('platforms')) {
            $query->whereIn('platform', $request->input('platforms'));
        } elseif ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Rating filters (on normalized_rating)
        if ($request->has('ratings')) {
            $query->whereIn('normalized_rating', $request->input('ratings'));
        } elseif ($request->has('rating')) {
            $query->where('normalized_rating', $request->rating);
        }

        // Has reply filter
        if ($request->has('has_reply')) {
            if (filter_var($request->has_reply, FILTER_VALIDATE_BOOLEAN)) {
                $query->withReply();
            } else {
                $query->withoutReply();
            }
        }

        // Text search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Date range filters
        if ($request->has('from_date')) {
            $query->where('published_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('published_at', '<=', $request->to_date);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'review_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'rating' => 'normalized_rating',
            'created_at' => 'created_at',
            default => 'published_at',
        };
        $query->orderBy($sortColumn, $sortOrder);

        // Standard pagination (TriggerFlow frontend uses current_page, last_page, total)
        $perPage = min(max((int) $request->get('per_page', 20), 1), 100);
        $reviews = $query->paginate($perPage);

        // Enrich response
        $enrichedReviews = collect($reviews->items())->map(function (Review $review) {
            $data = $review->toArray();
            $data['has_reply'] = $review->has_reply;
            $data['full_comment'] = $review->full_comment;
            $data['connection_label'] = $review->reviewConnection?->label ?? $review->reviewConnection?->getDisplayName();
            $data['platform_url'] = $review->platform_url;

            return $data;
        });

        return response()->json([
            'reviews' => $enrichedReviews,
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Get statistics for a location (extended).
     *
     * GET /api/triggerflow/locations/{externalId}/stats
     */
    public function getStats(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $locationIds = [$location->id];

        // If user has multiple locations (group), include by_facility
        $allLocations = Location::where('user_id', $user->id)
            ->where('external_source', 'triggerflow')
            ->get(['id', 'name']);

        if ($request->boolean('include_group') && $allLocations->count() > 1) {
            $locationIds = $allLocations->pluck('id')->toArray();
        }

        // Main stats
        $stats = DB::table('reviews')
            ->whereIn('location_id', $locationIds)
            ->selectRaw('
                COUNT(*) as total_reviews,
                AVG(normalized_rating) as average_rating,
                COUNT(CASE WHEN normalized_rating = 1 THEN 1 END) as rating_1,
                COUNT(CASE WHEN normalized_rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN normalized_rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN normalized_rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN normalized_rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN reply IS NOT NULL AND reply != "" THEN 1 END) as reviews_with_reply,
                COUNT(CASE WHEN reply IS NULL OR reply = "" THEN 1 END) as reviews_without_reply,
                COUNT(CASE WHEN published_at >= ? THEN 1 END) as recent_reviews_count,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = "replied" THEN 1 END) as replied_count,
                COUNT(CASE WHEN normalized_rating >= 4 THEN 1 END) as positive_count,
                COUNT(CASE WHEN normalized_rating <= 2 THEN 1 END) as negative_count
            ', [now()->subDays(30)])
            ->first();

        $totalReviews = (int) $stats->total_reviews;
        $reviewsWithReply = (int) $stats->reviews_with_reply;
        $replyRate = $totalReviews > 0 ? round(($reviewsWithReply / $totalReviews) * 100, 2) : 0;

        // Platform breakdown
        $platformStats = DB::table('reviews')
            ->whereIn('location_id', $locationIds)
            ->selectRaw('platform, COUNT(*) as total, AVG(normalized_rating) as avg_rating, AVG(rating) as avg_original_rating')
            ->groupBy('platform')
            ->get()
            ->map(function ($row) {
                $data = [
                    'platform' => $row->platform,
                    'total' => (int) $row->total,
                    'avg_rating' => round((float) $row->avg_rating, 2),
                ];
                // Include original rating for Booking (1-10 scale)
                if ($row->platform === 'booking') {
                    $data['avg_original_rating'] = round((float) $row->avg_original_rating, 1);
                }

                return $data;
            });

        $response = [
            'stats' => [
                'total_reviews' => $totalReviews,
                'average_rating' => round((float) $stats->average_rating, 2),
                'rating_distribution' => [
                    '1' => (int) $stats->rating_1,
                    '2' => (int) $stats->rating_2,
                    '3' => (int) $stats->rating_3,
                    '4' => (int) $stats->rating_4,
                    '5' => (int) $stats->rating_5,
                ],
                'reviews_with_reply' => $reviewsWithReply,
                'reviews_without_reply' => (int) $stats->reviews_without_reply,
                'reply_rate' => $replyRate,
                'recent_reviews_count' => (int) $stats->recent_reviews_count,
                'pending_count' => (int) $stats->pending_count,
                'replied_count' => (int) $stats->replied_count,
                'positive_count' => (int) $stats->positive_count,
                'negative_count' => (int) $stats->negative_count,
            ],
            'by_platform' => $platformStats,
        ];

        // Add by_facility breakdown for groups
        if ($request->boolean('include_group') && $allLocations->count() > 1) {
            $facilityStats = DB::table('reviews')
                ->whereIn('location_id', $locationIds)
                ->selectRaw('
                    location_id,
                    COUNT(*) as total_reviews,
                    AVG(normalized_rating) as avg_rating,
                    COUNT(CASE WHEN reply IS NOT NULL AND reply != "" THEN 1 END) as with_reply,
                    COUNT(*) as total
                ')
                ->groupBy('location_id')
                ->get();

            $response['by_facility'] = $facilityStats->map(function ($row) use ($allLocations) {
                $loc = $allLocations->firstWhere('id', $row->location_id);
                $total = (int) $row->total;
                $withReply = (int) $row->with_reply;

                return [
                    'location_id' => $row->location_id,
                    'name' => $loc?->name ?? 'Unknown',
                    'total_reviews' => $total,
                    'avg_rating' => round((float) $row->avg_rating, 2),
                    'reply_rate' => $total > 0 ? round(($withReply / $total) * 100, 2) : 0,
                ];
            });
        }

        return response()->json($response);
    }

    /**
     * Update a review's status.
     *
     * PATCH /api/triggerflow/reviews/{reviewId}
     */
    public function updateReview(Request $request, int $reviewId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,replied,ignored',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $review = $this->findUserReview($user, $reviewId);

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $review->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->fresh(),
        ]);
    }

    /**
     * Reply to a Google review.
     *
     * POST /api/triggerflow/reviews/{reviewId}/reply
     */
    public function replyToReview(Request $request, int $reviewId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $review = $this->findUserReview($user, $reviewId);

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        if ($review->platform !== 'google') {
            return response()->json(['message' => 'Reply posting is only supported for Google reviews'], 422);
        }

        if (!$review->can_reply) {
            return response()->json(['message' => 'This review cannot receive replies via API'], 422);
        }

        try {
            $this->googleReviewService->replyToReview($review, $request->comment);

            // Also update our local reply fields
            $review->update([
                'reply' => $request->comment,
                'reply_date' => now(),
            ]);

            return response()->json([
                'message' => 'Reply posted successfully',
                'review' => $review->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to post Google reply via TriggerFlow', [
                'review_id' => $reviewId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to post reply',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== CONNECTIONS ====================

    /**
     * Get connections for a location.
     *
     * GET /api/triggerflow/locations/{externalId}/connections
     */
    public function getConnections(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connections = $location->reviewConnections()
            ->withCount('reviews')
            ->get()
            ->map(fn ($c) => $this->formatConnection($c));

        return response()->json([
            'connections' => $connections,
        ]);
    }

    /**
     * Create or update a connection for a location.
     *
     * POST /api/triggerflow/locations/{externalId}/connections
     */
    public function createConnection(Request $request, string $externalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|in:google,booking,tripadvisor,airbnb',
            'platform_url' => 'nullable|url|max:500',
            'platform_name' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connection = ReviewConnection::updateOrCreate(
            [
                'location_id' => $location->id,
                'platform' => $validated['platform'],
            ],
            [
                'platform_url' => $validated['platform_url'] ?? null,
                'platform_name' => $validated['platform_name'] ?? null,
                'label' => $validated['label'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]
        );

        return response()->json([
            'message' => 'Connection saved successfully',
            'connection' => $connection,
        ]);
    }

    /**
     * Show a single connection with details.
     *
     * GET /api/triggerflow/locations/{externalId}/connections/{connectionId}
     */
    public function showConnection(Request $request, string $externalId, int $connectionId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connection = $location->reviewConnections()->withCount('reviews')->find($connectionId);
        if (!$connection) {
            return $this->connectionNotFound();
        }

        $avgRating = Review::where('review_connection_id', $connection->id)
            ->avg('normalized_rating');

        $data = $this->formatConnection($connection);
        $data['average_rating'] = $avgRating ? round((float) $avgRating, 2) : null;
        $data['is_configured'] = $connection->hasUrl() || $connection->has_valid_token;
        $data['needs_reconnect'] = $connection->is_google
            && !empty($connection->access_token)
            && !$connection->has_valid_token;

        return response()->json(['connection' => $data]);
    }

    /**
     * Update a connection.
     *
     * PATCH /api/triggerflow/locations/{externalId}/connections/{connectionId}
     */
    public function updateConnection(Request $request, string $externalId, int $connectionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'nullable|boolean',
            'label' => 'nullable|string|max:255',
            'platform_url' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connection = $this->findConnection($location, $connectionId);
        if (!$connection) {
            return $this->connectionNotFound();
        }

        $connection->update($request->only(['is_active', 'label', 'platform_url']));

        return response()->json([
            'message' => 'Connection updated successfully',
            'connection' => $connection->fresh(),
        ]);
    }

    /**
     * Delete a connection.
     *
     * DELETE /api/triggerflow/locations/{externalId}/connections/{connectionId}
     */
    public function deleteConnection(Request $request, string $externalId, int $connectionId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connection = $this->findConnection($location, $connectionId);
        if (!$connection) {
            return $this->connectionNotFound();
        }

        $connection->delete();

        return response()->json(['message' => 'Connection deleted successfully']);
    }

    /**
     * Sync a single connection.
     *
     * POST /api/triggerflow/locations/{externalId}/connections/{connectionId}/sync
     */
    public function syncConnection(Request $request, string $externalId, int $connectionId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connection = $this->findConnection($location, $connectionId);
        if (!$connection) {
            return $this->connectionNotFound();
        }

        if (!$connection->is_active) {
            return response()->json(['message' => 'Connection is not active'], 422);
        }

        if ($connection->isSyncLocked()) {
            return response()->json([
                'message' => 'Sync is already in progress',
                'sync_locked_until' => $connection->sync_started_at
                    ?->addMinutes(ReviewConnection::SYNC_LOCK_DURATION_MINUTES)
                    ->toIso8601String(),
            ], 409);
        }

        return $this->triggerSync($connection);
    }

    /**
     * Sync all active connections for a location.
     *
     * POST /api/triggerflow/locations/{externalId}/sync-all
     */
    public function syncAllConnections(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $connections = $location->reviewConnections()->active()->get();

        if ($connections->isEmpty()) {
            return response()->json(['message' => 'No active connections found'], 422);
        }

        $results = [];
        foreach ($connections as $connection) {
            if ($connection->isSyncLocked()) {
                $results[] = [
                    'connection_id' => $connection->id,
                    'platform' => $connection->platform,
                    'status' => 'skipped',
                    'reason' => 'Sync already in progress',
                ];
                continue;
            }

            try {
                $this->triggerSyncForConnection($connection);
                $results[] = [
                    'connection_id' => $connection->id,
                    'platform' => $connection->platform,
                    'status' => 'started',
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'connection_id' => $connection->id,
                    'platform' => $connection->platform,
                    'status' => 'failed',
                    'reason' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Sync initiated',
            'results' => $results,
        ]);
    }

    // ==================== REPLY GENERATION ====================

    /**
     * Generate an AI reply for a review.
     *
     * POST /api/triggerflow/replies/generate
     */
    public function generateReply(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'review_content' => 'required|string|max:5000',
            'review_rating' => 'required|integer|min:1|max:5',
            'review_author' => 'nullable|string|max:255',
            'platform' => 'required|string',
            'tone' => 'nullable|string|in:professional,warm,casual,luxury,dynamic',
            'language' => 'nullable|string|max:5',
            'external_location_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        // Find location if provided
        $location = null;
        if (!empty($validated['external_location_id'])) {
            $location = $this->findLocation($user, $validated['external_location_id']);
        }

        $result = $this->replyGenerator->generate([
            'content' => $validated['review_content'],
            'rating' => $validated['review_rating'],
            'author' => $validated['review_author'] ?? 'Customer',
            'platform' => $validated['platform'],
        ], [
            'tone' => $validated['tone'] ?? 'professional',
            'language' => $validated['language'] ?? 'auto',
            'location' => $location,
        ]);

        return response()->json([
            'reply' => $result['reply'],
            'tone' => $result['tone'],
            'language' => $result['language'],
            'tokens_used' => $result['tokens_used'],
        ]);
    }

    /**
     * Bulk generate AI replies for multiple reviews.
     *
     * POST /api/triggerflow/replies/bulk-generate
     */
    public function bulkGenerateReplies(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'review_ids' => 'required|array|min:1|max:50',
            'review_ids.*' => 'required|integer',
            'tone' => 'nullable|string|in:professional,warm,casual,luxury,dynamic',
            'language' => 'nullable|string|max:5',
            'custom_prompt' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        // Load all reviews in one query
        $reviews = Review::whereIn('id', $validated['review_ids'])
            ->with('location')
            ->get();

        // Verify all reviews belong to user's locations
        $userLocationIds = Location::where('user_id', $user->id)->pluck('id')->toArray();
        $reviews = $reviews->filter(fn ($r) => in_array($r->location_id, $userLocationIds));

        $results = [];
        $totalGenerated = 0;
        $totalFailed = 0;

        foreach ($validated['review_ids'] as $reviewId) {
            $review = $reviews->firstWhere('id', $reviewId);

            if (!$review) {
                $results[] = [
                    'review_id' => $reviewId,
                    'success' => false,
                    'reply' => null,
                    'error' => 'Review not found or not accessible',
                ];
                $totalFailed++;
                continue;
            }

            try {
                $options = [
                    'tone' => $validated['tone'] ?? 'professional',
                    'language' => $validated['language'] ?? 'auto',
                    'location' => $review->location,
                ];

                if (!empty($validated['custom_prompt'])) {
                    $options['specific_context'] = $validated['custom_prompt'];
                }

                $result = $this->replyGenerator->generate([
                    'content' => $review->full_comment ?: $review->content,
                    'rating' => $review->normalized_rating ?? $review->rating,
                    'author' => $review->author_name ?? 'Customer',
                    'platform' => $review->platform,
                ], $options);

                $results[] = [
                    'review_id' => $reviewId,
                    'success' => true,
                    'reply' => $result['reply'],
                    'error' => null,
                ];
                $totalGenerated++;
            } catch (\Exception $e) {
                Log::warning('Bulk reply generation failed for review', [
                    'review_id' => $reviewId,
                    'error' => $e->getMessage(),
                ]);

                $results[] = [
                    'review_id' => $reviewId,
                    'success' => false,
                    'reply' => null,
                    'error' => 'Generation failed',
                ];
                $totalFailed++;
            }
        }

        return response()->json([
            'results' => $results,
            'total_requested' => count($validated['review_ids']),
            'total_generated' => $totalGenerated,
            'total_failed' => $totalFailed,
        ]);
    }

    // ==================== ALERTS ====================

    /**
     * Get alert configuration for a location.
     *
     * GET /api/triggerflow/locations/{externalId}/alerts
     */
    public function getAlerts(Request $request, string $externalId): JsonResponse
    {
        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        return response()->json([
            'alerts' => [
                'alerts_enabled' => $location->alerts_enabled,
                'alert_email' => $location->alert_email,
                'alert_slack_webhook' => $location->alert_slack_webhook ? '***configured***' : null,
                'alert_negative_threshold' => $location->alert_negative_threshold,
                'alert_negative_window_days' => $location->alert_negative_window_days,
                'alert_sentiment_threshold' => $location->alert_sentiment_threshold,
                'alert_on_1_star' => $location->alert_on_1_star,
                'alert_on_2_star' => $location->alert_on_2_star,
                'alert_on_negative_trend' => $location->alert_on_negative_trend,
                'alert_on_theme_spike' => $location->alert_on_theme_spike,
                'alert_recap_frequency' => $location->alert_recap_frequency,
                'alert_recap_emails' => $location->alert_recap_emails,
            ],
        ]);
    }

    /**
     * Update alert configuration for a location.
     *
     * PUT /api/triggerflow/locations/{externalId}/alerts
     */
    public function updateAlerts(Request $request, string $externalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'alerts_enabled' => 'nullable|boolean',
            'alert_email' => 'nullable|email|max:255',
            'alert_slack_webhook' => 'nullable|url|max:500',
            'alert_negative_threshold' => 'nullable|integer|min:1|max:10',
            'alert_negative_window_days' => 'nullable|integer|min:1|max:90',
            'alert_sentiment_threshold' => 'nullable|numeric|min:0|max:1',
            'alert_on_1_star' => 'nullable|boolean',
            'alert_on_2_star' => 'nullable|boolean',
            'alert_on_negative_trend' => 'nullable|boolean',
            'alert_on_theme_spike' => 'nullable|boolean',
            'alert_recap_frequency' => 'nullable|string|in:none,daily,weekly,monthly',
            'alert_recap_emails' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $location = $this->findLocation($user, $externalId);
        if (!$location) {
            return $this->locationNotFound();
        }

        $location->update($request->only([
            'alerts_enabled', 'alert_email', 'alert_slack_webhook',
            'alert_negative_threshold', 'alert_negative_window_days',
            'alert_sentiment_threshold', 'alert_on_1_star', 'alert_on_2_star',
            'alert_on_negative_trend', 'alert_on_theme_spike',
            'alert_recap_frequency', 'alert_recap_emails',
        ]));

        return response()->json([
            'message' => 'Alert settings updated successfully',
        ]);
    }

    // ==================== GROUP / MULTI-FACILITY ====================

    /**
     * Get child locations (facilities) for the user.
     *
     * GET /api/triggerflow/facilities/children
     */
    public function getFacilityChildren(Request $request): JsonResponse
    {
        $user = $request->user();

        $locations = Location::where('user_id', $user->id)
            ->where('external_source', 'triggerflow')
            ->withCount('reviews')
            ->get()
            ->map(function ($loc) {
                return [
                    'id' => $loc->id,
                    'external_id' => $loc->external_facility_id,
                    'name' => $loc->name,
                    'address' => $loc->address,
                    'reviews_count' => $loc->reviews_count,
                ];
            });

        return response()->json(['facilities' => $locations]);
    }

    /**
     * Get aggregated platforms across all facilities.
     *
     * GET /api/triggerflow/facilities/group-platforms
     */
    public function getGroupPlatforms(Request $request): JsonResponse
    {
        $user = $request->user();

        $locationIds = Location::where('user_id', $user->id)
            ->where('external_source', 'triggerflow')
            ->pluck('id');

        $platforms = ReviewConnection::whereIn('location_id', $locationIds)
            ->active()
            ->selectRaw('platform, COUNT(*) as connection_count')
            ->groupBy('platform')
            ->get();

        return response()->json(['platforms' => $platforms]);
    }

    // ==================== GOOGLE OAUTH ====================

    /**
     * Get Google OAuth authorization URL.
     *
     * GET /api/triggerflow/google/auth-url
     */
    public function getGoogleAuthUrl(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'external_location_id' => 'required|string',
            'redirect_uri' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        $location = $this->findLocation($user, $validated['external_location_id']);
        if (!$location) {
            return $this->locationNotFound();
        }

        $authUrl = $this->googleAuthService->getAuthUrl(
            $location->id,
            $validated['redirect_uri'] ?? null
        );

        return response()->json([
            'auth_url' => $authUrl,
        ]);
    }

    /**
     * Handle Google OAuth callback.
     *
     * POST /api/triggerflow/google/callback
     */
    public function handleGoogleCallback(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'state' => 'required|string',
            'redirect_uri' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $validated = $validator->validated();

        try {
            $stateData = $this->googleAuthService->decodeState($validated['state']);
            $locationId = $stateData['location_id'];

            $location = Location::where('id', $locationId)
                ->where('user_id', $user->id)
                ->first();

            if (!$location) {
                return $this->locationNotFound();
            }

            $tokens = $this->googleAuthService->handleCallback(
                $validated['code'],
                $validated['redirect_uri'] ?? null
            );

            $connection = ReviewConnection::updateOrCreate(
                [
                    'location_id' => $location->id,
                    'platform' => 'google',
                ],
                [
                    'is_active' => true,
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'token_expires_at' => now()->addSeconds($tokens['expires_in']),
                ]
            );

            return response()->json([
                'message' => 'Google account connected successfully',
                'connection_id' => $connection->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to connect Google account',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Find a location by external ID for the given user.
     */
    private function findLocation(User $user, string $externalId): ?Location
    {
        return Location::byExternalId($externalId, 'triggerflow')
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * Find a connection belonging to a location, or return null.
     */
    private function findConnection(Location $location, int $connectionId): ?ReviewConnection
    {
        return $location->reviewConnections()->find($connectionId);
    }

    /**
     * Find a review that belongs to one of the user's locations.
     */
    private function findUserReview(User $user, int $reviewId): ?Review
    {
        $locationIds = Location::where('user_id', $user->id)->pluck('id');

        return Review::where('id', $reviewId)
            ->whereIn('location_id', $locationIds)
            ->first();
    }

    /**
     * Get validated location IDs for the user.
     */
    private function getUserLocationIds(User $user, array $requestedIds): array
    {
        return Location::where('user_id', $user->id)
            ->where('external_source', 'triggerflow')
            ->whereIn('id', $requestedIds)
            ->pluck('id')
            ->toArray();
    }

    /**
     * Return a standard 404 response for missing location.
     */
    private function locationNotFound(): JsonResponse
    {
        return response()->json(['message' => 'Location not found'], 404);
    }

    /**
     * Return a standard 404 response for missing connection.
     */
    private function connectionNotFound(): JsonResponse
    {
        return response()->json(['message' => 'Connection not found'], 404);
    }

    /**
     * Format a connection for API response.
     */
    private function formatConnection(ReviewConnection $connection): array
    {
        return [
            'id' => $connection->id,
            'platform' => $connection->platform,
            'is_active' => $connection->is_active,
            'platform_url' => $connection->platform_url,
            'platform_name' => $connection->platform_name,
            'label' => $connection->label,
            'last_synced_at' => $connection->last_synced_at?->toIso8601String(),
            'sync_error' => $connection->sync_error,
            'apify_enabled' => $connection->apify_enabled,
            'has_oauth' => $connection->is_google && $connection->has_valid_token,
            'is_sync_locked' => $connection->is_sync_locked,
            'sync_locked_until' => $connection->isSyncLocked()
                ? $connection->sync_started_at?->addMinutes(ReviewConnection::SYNC_LOCK_DURATION_MINUTES)->toIso8601String()
                : null,
            'reviews_count' => $connection->reviews_count ?? 0,
        ];
    }

    /**
     * Trigger sync for a single connection.
     */
    private function triggerSync(ReviewConnection $connection): JsonResponse
    {
        try {
            $this->triggerSyncForConnection($connection);

            return response()->json([
                'message' => 'Sync started',
                'connection_id' => $connection->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to start sync',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start sync process for a connection (Google API or Apify).
     */
    private function triggerSyncForConnection(ReviewConnection $connection): void
    {
        $connection->markSyncStarted('triggerflow');

        if ($connection->is_google && $connection->has_valid_token) {
            // Google API sync is handled by existing GoogleBusinessController flow
            // Mark as started - the actual sync is async via jobs
            return;
        }

        if ($connection->canUseApify()) {
            $apifyService = app(ApifyService::class);

            match ($connection->platform) {
                'tripadvisor' => $apifyService->requestTripAdvisorReviews($connection),
                'booking' => $apifyService->requestBookingReviews($connection),
                'airbnb' => $apifyService->requestAirbnbReviews($connection),
                default => throw new \Exception("Unsupported platform for sync: {$connection->platform}"),
            };

            return;
        }

        $connection->markSyncFailed('No sync method available');
        throw new \Exception('No sync method available for this connection');
    }
}
