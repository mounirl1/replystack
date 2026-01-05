<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LocationController extends Controller
{
    /**
     * Display a listing of the user's locations.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $locations = Location::where(function ($query) use ($user) {
            $query->where('user_id', $user->id);

            if ($user->organization_id) {
                $query->orWhere('organization_id', $user->organization_id);
            }
        })
            ->with('responseProfile')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'locations' => $locations,
            'can_add' => $user->canAddLocation(),
            'max_locations' => $user->getMaxLocations(),
            'current_count' => $locations->count(),
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->canAddLocation()) {
            return response()->json([
                'message' => __('api.locations.limit_reached'),
                'max_locations' => $user->getMaxLocations(),
                'upgrade_required' => true,
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'google_place_id' => 'nullable|string|max:255',
            'tripadvisor_id' => 'nullable|string|max:255',
            'booking_id' => 'nullable|string|max:255',
            'yelp_id' => 'nullable|string|max:255',
            'facebook_page_id' => 'nullable|string|max:255',
            'default_tone' => 'nullable|in:professional,friendly,formal,casual',
            'default_language' => 'nullable|string|max:5',
        ]);

        $location = Location::create([
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'google_place_id' => $validated['google_place_id'] ?? null,
            'tripadvisor_id' => $validated['tripadvisor_id'] ?? null,
            'booking_id' => $validated['booking_id'] ?? null,
            'yelp_id' => $validated['yelp_id'] ?? null,
            'facebook_page_id' => $validated['facebook_page_id'] ?? null,
            'default_tone' => $validated['default_tone'] ?? 'professional',
            'default_language' => $validated['default_language'] ?? 'auto',
        ]);

        return response()->json([
            'message' => __('api.locations.created'),
            'location' => $location,
        ], 201);
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): JsonResponse
    {
        $user = Auth::user();

        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_found'),
            ], 404);
        }

        $location->load('responseProfile');

        return response()->json([
            'location' => $location,
        ]);
    }

    /**
     * Update the specified location.
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        $user = Auth::user();

        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_found'),
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string|max:500',
            'google_place_id' => 'nullable|string|max:255',
            'tripadvisor_id' => 'nullable|string|max:255',
            'booking_id' => 'nullable|string|max:255',
            'yelp_id' => 'nullable|string|max:255',
            'facebook_page_id' => 'nullable|string|max:255',
            'default_tone' => 'nullable|in:professional,friendly,formal,casual',
            'default_language' => 'nullable|string|max:5',
        ]);

        $location->update($validated);

        return response()->json([
            'message' => __('api.locations.updated'),
            'location' => $location->fresh(),
        ]);
    }

    /**
     * Remove the specified location.
     */
    public function destroy(Location $location): JsonResponse
    {
        $user = Auth::user();

        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_found'),
            ], 404);
        }

        // Check if this is the last location for non-Business users
        $locationCount = $user->locations()->count();
        if ($locationCount <= 1 && !$user->hasPlanOrHigher('business')) {
            return response()->json([
                'message' => __('api.locations.cannot_delete_last'),
            ], 403);
        }

        $location->delete();

        return response()->json([
            'message' => __('api.locations.deleted'),
        ]);
    }

    /**
     * Check if a user can access a specific location.
     */
    private function userCanAccessLocation($user, Location $location): bool
    {
        // User owns the location directly
        if ($location->user_id === $user->id) {
            return true;
        }

        // User is in the same organization as the location
        if ($user->organization_id && $location->organization_id === $user->organization_id) {
            return true;
        }

        return false;
    }
}
