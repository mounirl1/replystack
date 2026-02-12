<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ApifyRequest;
use App\Models\Location;
use App\Models\ReviewConnection;
use App\Services\Apify\ApifyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * SuperAdmin ReviewConnectionController
 *
 * Admin-only endpoints for managing review connections and Apify settings.
 */
class ReviewConnectionController extends Controller
{
    public function __construct(
        private readonly ApifyService $apifyService
    ) {}

    /**
     * List all connections for a location.
     *
     * GET /api/super-admin/locations/{location}/connections
     */
    public function index(Location $location): JsonResponse
    {
        $connections = $location->reviewConnections()
            ->with(['apifyRequests' => function ($query) {
                $query->latest()->limit(5);
            }])
            ->get();

        return response()->json([
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'external_facility_id' => $location->external_facility_id,
            ],
            'connections' => $connections,
        ]);
    }

    /**
     * Toggle Apify for a connection.
     *
     * PATCH /api/super-admin/connections/{connection}/apify
     */
    public function toggleApify(Request $request, ReviewConnection $connection): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if platform supports Apify
        if (!$connection->supportsApify()) {
            return response()->json([
                'message' => 'This platform does not support Apify scraping',
            ], 400);
        }

        $connection->update([
            'apify_enabled' => $request->boolean('enabled'),
        ]);

        return response()->json([
            'message' => $request->boolean('enabled')
                ? 'Apify enabled for this connection'
                : 'Apify disabled for this connection',
            'connection' => $connection->fresh(),
        ]);
    }

    /**
     * List all Apify requests.
     *
     * GET /api/super-admin/apify-requests
     */
    public function listApifyRequests(Request $request): JsonResponse
    {
        $query = ApifyRequest::with('reviewConnection.location')
            ->orderByDesc('created_at');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        // Filter by location_id
        if ($request->has('location_id')) {
            $query->whereHas('reviewConnection', function ($q) use ($request) {
                $q->where('location_id', $request->location_id);
            });
        }

        $requests = $query->cursorPaginate(50);

        return response()->json([
            'requests' => $requests->items(),
            'next_cursor' => $requests->nextCursor()?->encode(),
            'has_more' => $requests->hasMorePages(),
        ]);
    }

    /**
     * Get details of a specific Apify request.
     *
     * GET /api/super-admin/apify-requests/{apifyRequest}
     */
    public function showApifyRequest(ApifyRequest $apifyRequest): JsonResponse
    {
        $apifyRequest->load('reviewConnection.location');

        // Optionally fetch current status from Apify
        $liveStatus = null;
        if (!$apifyRequest->is_finished && $this->apifyService->isConfigured()) {
            try {
                $liveStatus = $this->apifyService->getRunStatus($apifyRequest->run_id);
            } catch (\Exception $e) {
                // Ignore errors
            }
        }

        return response()->json([
            'request' => $apifyRequest,
            'live_status' => $liveStatus,
        ]);
    }

    /**
     * Manually trigger Apify scraping for a connection.
     *
     * POST /api/super-admin/connections/{connection}/scrape
     */
    public function triggerScrape(Request $request, ReviewConnection $connection): JsonResponse
    {
        if (!$connection->canUseApify()) {
            return response()->json([
                'message' => 'Apify is not enabled or not supported for this connection',
            ], 400);
        }

        if ($connection->isSyncLocked()) {
            return response()->json([
                'message' => 'Sync already in progress',
            ], 409);
        }

        if (!$this->apifyService->isConfigured()) {
            return response()->json([
                'message' => 'Apify is not configured',
            ], 503);
        }

        $limit = $request->integer('limit', 100);

        try {
            $connection->markSyncStarted('apify');

            $apifyRequest = match ($connection->platform) {
                'tripadvisor' => $this->apifyService->requestTripAdvisorReviews($connection, $limit),
                'booking' => $this->apifyService->requestBookingReviews($connection, $limit),
                'airbnb' => $this->apifyService->requestAirbnbReviews($connection, $limit),
                default => throw new \Exception('Unsupported platform'),
            };

            return response()->json([
                'message' => 'Scraping started',
                'apify_request' => $apifyRequest,
            ]);
        } catch (\Exception $e) {
            $connection->markSyncFailed($e->getMessage());

            return response()->json([
                'message' => 'Failed to start scraping',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all connections with Apify enabled.
     *
     * GET /api/super-admin/apify-connections
     */
    public function listApifyConnections(Request $request): JsonResponse
    {
        $connections = ReviewConnection::with('location')
            ->apifyEnabled()
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'connections' => $connections,
            'total' => $connections->count(),
        ]);
    }

    /**
     * Get statistics about Apify usage.
     *
     * GET /api/super-admin/apify-stats
     */
    public function apifyStats(): JsonResponse
    {
        $stats = [
            'total_requests' => ApifyRequest::count(),
            'pending' => ApifyRequest::pending()->count(),
            'running' => ApifyRequest::running()->count(),
            'completed' => ApifyRequest::completed()->count(),
            'failed' => ApifyRequest::failed()->count(),
            'total_reviews_received' => ApifyRequest::completed()->sum('reviews_received'),
            'enabled_connections' => ReviewConnection::apifyEnabled()->count(),
        ];

        $byPlatform = ApifyRequest::selectRaw('platform, COUNT(*) as count, SUM(reviews_received) as total_reviews')
            ->groupBy('platform')
            ->get();

        $recentRequests = ApifyRequest::with('reviewConnection.location')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'by_platform' => $byPlatform,
            'recent_requests' => $recentRequests,
        ]);
    }
}
