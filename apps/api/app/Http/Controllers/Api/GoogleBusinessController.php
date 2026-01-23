<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncGoogleReviewsJob;
use App\Models\Location;
use App\Models\ReviewConnection;
use App\Services\Google\GoogleBusinessAccountService;
use App\Services\Google\GoogleBusinessAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * GoogleBusinessController
 *
 * Handles Google Business Profile connection management.
 */
class GoogleBusinessController extends Controller
{
    public function __construct(
        private readonly GoogleBusinessAuthService $authService,
        private readonly GoogleBusinessAccountService $accountService
    ) {}

    /**
     * Get available Google Business accounts for a connection.
     *
     * GET /api/google-business/{connection}/accounts
     */
    public function getAccounts(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$connection->has_valid_token) {
            return response()->json([
                'message' => 'Google account not connected or token expired',
            ], 400);
        }

        try {
            $accounts = $this->accountService->getAccounts($connection);

            return response()->json([
                'accounts' => $accounts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch accounts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get locations for a Google Business account.
     *
     * GET /api/google-business/{connection}/locations
     */
    public function getLocations(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'account_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!$connection->has_valid_token) {
            return response()->json([
                'message' => 'Google account not connected or token expired',
            ], 400);
        }

        try {
            $locations = $this->accountService->getLocations(
                $connection,
                $request->account_name
            );

            return response()->json([
                'locations' => $locations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch locations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Select account and location for a connection.
     *
     * POST /api/google-business/{connection}/select
     */
    public function selectLocation(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'account_name' => 'required|string',
            'location_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->accountService->selectAccountAndLocation(
            $connection,
            $request->account_name,
            $request->location_id
        );

        return response()->json([
            'message' => 'Location selected successfully',
            'connection' => $connection->fresh(),
        ]);
    }

    /**
     * Sync reviews from Google Business Profile.
     *
     * POST /api/google-business/{connection}/sync
     */
    public function syncReviews(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$connection->has_valid_token) {
            return response()->json([
                'message' => 'Google account not connected or token expired',
            ], 400);
        }

        if ($connection->isSyncLocked()) {
            return response()->json([
                'message' => 'Sync already in progress',
            ], 409);
        }

        // Dispatch sync job
        SyncGoogleReviewsJob::dispatch($connection);

        return response()->json([
            'message' => 'Sync started',
        ]);
    }

    /**
     * Disconnect Google Business Profile.
     *
     * DELETE /api/google-business/{connection}
     */
    public function disconnect(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->authService->revokeAccess($connection);

        return response()->json([
            'message' => 'Google account disconnected',
        ]);
    }

    /**
     * Check connection status.
     *
     * GET /api/google-business/{connection}/status
     */
    public function status(Request $request, ReviewConnection $connection): JsonResponse
    {
        $user = $request->user();

        // Verify ownership
        if ($connection->location->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'connected' => $connection->has_valid_token,
            'account_name' => $connection->account_name,
            'location_id_google' => $connection->location_id_google,
            'last_synced_at' => $connection->last_synced_at?->toIso8601String(),
            'sync_error' => $connection->sync_error,
            'is_sync_locked' => $connection->is_sync_locked,
        ]);
    }
}
