<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncReviewsRequest;
use App\Models\Location;
use App\Services\ReviewSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewSyncController extends Controller
{
    public function __construct(
        protected ReviewSyncService $syncService
    ) {}

    /**
     * Sync reviews from extension.
     *
     * POST /api/reviews/sync
     */
    public function sync(SyncReviewsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $location = Location::findOrFail($validated['location_id']);

        // Transform reviews data for sync service
        $reviews = collect($validated['reviews'])->map(function ($review) {
            return [
                'external_id' => $review['external_id'],
                'author_name' => $review['author_name'],
                'rating' => $review['rating'],
                'content' => $review['content'],
                'published_at' => $review['published_at'],
                'status' => ($review['has_response'] ?? false) ? 'replied' : 'pending',
            ];
        })->toArray();

        $stats = $this->syncService->syncBatch(
            $location,
            $validated['platform'],
            $reviews,
            'extension'
        );

        return response()->json([
            'success' => true,
            'created' => $stats['created'],
            'updated' => $stats['updated'],
            'unchanged' => $stats['unchanged'],
            'errors' => $stats['errors'],
        ]);
    }

    /**
     * Get extraction tasks for extension.
     *
     * GET /api/locations/extraction-tasks
     */
    public function extractionTasks(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get user's locations with their non-API platforms
        $locations = Location::where('user_id', $user->id)
            ->orWhere('organization_id', $user->organization_id)
            ->where('auto_fetch_enabled', true)
            ->get();

        $tasks = $locations->map(function (Location $location) {
            $platforms = [];

            // TripAdvisor
            if ($location->tripadvisor_id) {
                $platforms[] = [
                    'platform' => 'tripadvisor',
                    'platform_id' => $location->tripadvisor_id,
                    'management_url' => $location->tripadvisor_management_url,
                    'last_fetched_at' => $location->last_extension_fetch_at?->toIso8601String(),
                ];
            }

            // Booking
            if ($location->booking_id) {
                $platforms[] = [
                    'platform' => 'booking',
                    'platform_id' => $location->booking_id,
                    'management_url' => $location->booking_management_url,
                    'last_fetched_at' => $location->last_extension_fetch_at?->toIso8601String(),
                ];
            }

            // Yelp
            if ($location->yelp_id) {
                $platforms[] = [
                    'platform' => 'yelp',
                    'platform_id' => $location->yelp_id,
                    'management_url' => $location->yelp_management_url,
                    'last_fetched_at' => $location->last_extension_fetch_at?->toIso8601String(),
                ];
            }

            // Google (if no API connection, extension can still scrape)
            if ($location->google_place_id && !$location->hasGoogleConnection()) {
                $platforms[] = [
                    'platform' => 'google',
                    'platform_id' => $location->google_place_id,
                    'management_url' => null,
                    'last_fetched_at' => $location->last_extension_fetch_at?->toIso8601String(),
                ];
            }

            // Facebook (if no API connection)
            if ($location->facebook_page_id && !$location->hasFacebookConnection()) {
                $platforms[] = [
                    'platform' => 'facebook',
                    'platform_id' => $location->facebook_page_id,
                    'management_url' => null,
                    'last_fetched_at' => $location->last_extension_fetch_at?->toIso8601String(),
                ];
            }

            return [
                'location_id' => $location->id,
                'location_name' => $location->name,
                'platforms' => $platforms,
            ];
        })->filter(fn($task) => !empty($task['platforms']))->values();

        return response()->json([
            'tasks' => $tasks,
        ]);
    }
}
