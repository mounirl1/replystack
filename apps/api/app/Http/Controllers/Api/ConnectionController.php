<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ConnectionController extends Controller
{
    /**
     * Get connection status for all platforms for a location.
     */
    public function index(Location $location): JsonResponse
    {
        // Check authorization
        if (Gate::denies('view', $location)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'google' => [
                'connected' => $location->hasGoogleConnection(),
                'token_valid' => $location->isGoogleTokenValid(),
                'last_fetch_at' => $location->last_api_fetch_at?->toISOString(),
                'expires_at' => $location->google_token_expires_at?->toISOString(),
            ],
            'facebook' => [
                'connected' => $location->hasFacebookConnection(),
                'token_valid' => $location->isFacebookTokenValid(),
                'last_fetch_at' => $location->last_api_fetch_at?->toISOString(),
                'expires_at' => $location->facebook_token_expires_at?->toISOString(),
            ],
            'tripadvisor' => [
                'connected' => !empty($location->tripadvisor_management_url),
                'management_url' => $location->tripadvisor_management_url,
                'last_extension_fetch_at' => $location->last_extension_fetch_at?->toISOString(),
            ],
            'booking' => [
                'connected' => !empty($location->booking_management_url),
                'management_url' => $location->booking_management_url,
                'last_extension_fetch_at' => $location->last_extension_fetch_at?->toISOString(),
            ],
            'yelp' => [
                'connected' => !empty($location->yelp_management_url),
                'management_url' => $location->yelp_management_url,
                'last_extension_fetch_at' => $location->last_extension_fetch_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Update management URLs for extension-based platforms.
     */
    public function updateManagementUrls(Request $request, Location $location): JsonResponse
    {
        // Check authorization
        if (Gate::denies('update', $location)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tripadvisor' => ['nullable', 'string', 'url', 'regex:/^https:\/\/(www\.)?tripadvisor\.(com|fr|de|es|it|co\.uk)/i'],
            'booking' => ['nullable', 'string', 'url', 'regex:/^https:\/\/(admin\.)?booking\.com/i'],
            'yelp' => ['nullable', 'string', 'url', 'regex:/^https:\/\/(biz\.)?yelp\.(com|fr|de|es|it|co\.uk)/i'],
        ], [
            'tripadvisor.regex' => 'The TripAdvisor URL must be a valid TripAdvisor domain.',
            'booking.regex' => 'The Booking URL must be a valid Booking.com domain.',
            'yelp.regex' => 'The Yelp URL must be a valid Yelp Business domain.',
        ]);

        $updates = [];

        if (array_key_exists('tripadvisor', $validated)) {
            $updates['tripadvisor_management_url'] = $validated['tripadvisor'];
        }

        if (array_key_exists('booking', $validated)) {
            $updates['booking_management_url'] = $validated['booking'];
        }

        if (array_key_exists('yelp', $validated)) {
            $updates['yelp_management_url'] = $validated['yelp'];
        }

        if (!empty($updates)) {
            $location->update($updates);
        }

        return response()->json([
            'message' => 'Management URLs updated successfully',
            'tripadvisor_management_url' => $location->tripadvisor_management_url,
            'booking_management_url' => $location->booking_management_url,
            'yelp_management_url' => $location->yelp_management_url,
        ]);
    }

    /**
     * Toggle auto-fetch setting for a location.
     */
    public function toggleAutoFetch(Request $request, Location $location): JsonResponse
    {
        // Check authorization
        if (Gate::denies('update', $location)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $location->update(['auto_fetch_enabled' => $validated['enabled']]);

        return response()->json([
            'message' => 'Auto-fetch setting updated',
            'auto_fetch_enabled' => $location->auto_fetch_enabled,
        ]);
    }
}
