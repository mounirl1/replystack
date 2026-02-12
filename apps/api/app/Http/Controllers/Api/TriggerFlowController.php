<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Review;
use App\Models\ReviewConnection;
use App\Services\AI\ReplyGeneratorService;
use App\Services\Google\GoogleBusinessAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        private readonly GoogleBusinessAuthService $googleAuthService
    ) {}

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

        // Find existing location by external ID or create new one
        $location = Location::byExternalId($validated['external_id'], 'triggerflow')
            ->where('user_id', $user->id)
            ->first();

        if ($location) {
            // Update existing
            $location->update([
                'name' => $validated['name'],
                'address' => $validated['address'] ?? $location->address,
                'default_tone' => $validated['default_tone'] ?? $location->default_tone,
                'default_language' => $validated['default_language'] ?? $location->default_language,
            ]);
        } else {
            // Create new
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

    /**
     * Get reviews for a location.
     *
     * GET /api/triggerflow/locations/{externalId}/reviews
     */
    public function getReviews(Request $request, string $externalId): JsonResponse
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

        $query = Review::where('location_id', $location->id)
            ->orderByDesc('published_at');

        // Apply filters
        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('from_date')) {
            $query->where('published_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('published_at', '<=', $request->to_date);
        }

        // Cursor pagination
        $reviews = $query->cursorPaginate($request->get('per_page', 50));

        return response()->json([
            'reviews' => $reviews->items(),
            'next_cursor' => $reviews->nextCursor()?->encode(),
            'has_more' => $reviews->hasMorePages(),
        ]);
    }

    /**
     * Get statistics for a location.
     *
     * GET /api/triggerflow/locations/{externalId}/stats
     */
    public function getStats(Request $request, string $externalId): JsonResponse
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

        $stats = DB::table('reviews')
            ->where('location_id', $location->id)
            ->selectRaw('
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = "replied" THEN 1 END) as replied_count,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count,
                COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_count
            ')
            ->first();

        // Platform breakdown
        $platformStats = DB::table('reviews')
            ->where('location_id', $location->id)
            ->selectRaw('platform, COUNT(*) as count, AVG(rating) as avg_rating')
            ->groupBy('platform')
            ->get();

        return response()->json([
            'stats' => [
                'total_reviews' => (int) $stats->total_reviews,
                'pending_count' => (int) $stats->pending_count,
                'replied_count' => (int) $stats->replied_count,
                'average_rating' => round((float) $stats->average_rating, 2),
                'positive_count' => (int) $stats->positive_count,
                'negative_count' => (int) $stats->negative_count,
            ],
            'by_platform' => $platformStats,
        ]);
    }

    /**
     * Get connections for a location.
     *
     * GET /api/triggerflow/locations/{externalId}/connections
     */
    public function getConnections(Request $request, string $externalId): JsonResponse
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

        $connections = $location->reviewConnections()
            ->select([
                'id', 'platform', 'is_active', 'platform_url', 'platform_name',
                'label', 'last_synced_at', 'sync_error', 'apify_enabled',
            ])
            ->get()
            ->map(function ($connection) {
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
                ];
            });

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

        $location = Location::byExternalId($externalId, 'triggerflow')
            ->where('user_id', $user->id)
            ->first();

        if (!$location) {
            return response()->json([
                'message' => 'Location not found',
            ], 404);
        }

        // Upsert connection
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

        // Check quota
        if (!$user->hasQuotaRemaining()) {
            return response()->json([
                'message' => 'Quota exceeded. Please upgrade your plan.',
            ], 429);
        }

        // Find location if provided
        $location = null;
        if (!empty($validated['external_location_id'])) {
            $location = Location::byExternalId($validated['external_location_id'], 'triggerflow')
                ->where('user_id', $user->id)
                ->first();
        }

        // Generate reply
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

        // Decrement quota
        $user->decrementQuota();

        return response()->json([
            'reply' => $result['reply'],
            'tone' => $result['tone'],
            'language' => $result['language'],
            'tokens_used' => $result['tokens_used'],
            'quota_remaining' => $user->fresh()->quota_remaining,
        ]);
    }

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

        $location = Location::byExternalId($validated['external_location_id'], 'triggerflow')
            ->where('user_id', $user->id)
            ->first();

        if (!$location) {
            return response()->json([
                'message' => 'Location not found',
            ], 404);
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
            // Decode state to get location ID
            $stateData = $this->googleAuthService->decodeState($validated['state']);
            $locationId = $stateData['location_id'];

            // Verify location belongs to user
            $location = Location::where('id', $locationId)
                ->where('user_id', $user->id)
                ->first();

            if (!$location) {
                return response()->json([
                    'message' => 'Location not found',
                ], 404);
            }

            // Exchange code for tokens
            $tokens = $this->googleAuthService->handleCallback(
                $validated['code'],
                $validated['redirect_uri'] ?? null
            );

            // Create or update Google connection
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
}
