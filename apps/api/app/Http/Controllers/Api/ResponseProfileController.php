<?php

namespace App\Http\Controllers\Api;

use App\Enums\BusinessSector;
use App\Enums\NegativeStrategy;
use App\Enums\ResponseLength;
use App\Enums\ResponseTone;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\LocationResponseProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Response Profile Controller
 *
 * Handles response profile configuration for locations.
 */
class ResponseProfileController extends Controller
{
    /**
     * Get the response profile for a location.
     *
     * GET /api/locations/{location}/response-profile
     *
     * @param Request $request
     * @param Location $location
     * @return JsonResponse
     */
    public function show(Request $request, Location $location): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check ownership
        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_accessible'),
            ], 404);
        }

        $profile = $location->responseProfile;

        if (!$profile) {
            // Return defaults if no profile exists
            return response()->json([
                'profile' => LocationResponseProfile::getDefaults($location),
                'exists' => false,
            ]);
        }

        return response()->json([
            'profile' => $profile,
            'exists' => true,
        ]);
    }

    /**
     * Create or update the response profile for a location.
     *
     * POST /api/locations/{location}/response-profile
     *
     * @param Request $request
     * @param Location $location
     * @return JsonResponse
     */
    public function store(Request $request, Location $location): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check ownership
        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_accessible'),
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'business_sector' => ['sometimes', 'nullable', 'string', 'in:' . implode(',', BusinessSector::values())],
            'business_name' => ['required', 'string', 'max:255'],
            'signature' => ['sometimes', 'nullable', 'string', 'max:255'],
            'tone' => ['required', 'string', 'in:' . implode(',', ResponseTone::values())],
            'default_length' => ['required', 'string', 'in:' . implode(',', ResponseLength::values())],
            'negative_strategy' => ['required', 'string', 'in:' . implode(',', NegativeStrategy::values())],
            'include_customer_name' => ['sometimes', 'boolean'],
            'include_business_name' => ['sometimes', 'boolean'],
            'include_emojis' => ['sometimes', 'boolean'],
            'include_invitation' => ['sometimes', 'boolean'],
            'include_signature' => ['sometimes', 'boolean'],
            'highlights' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'avoid_topics' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'additional_context' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'onboarding_completed' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => __('api.validation.failed'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Create or update profile
        $profile = LocationResponseProfile::updateOrCreate(
            ['location_id' => $location->id],
            $validated
        );

        return response()->json([
            'message' => __('api.response_profile.saved'),
            'profile' => $profile,
        ]);
    }

    /**
     * Reset the response profile to defaults.
     *
     * POST /api/locations/{location}/response-profile/reset
     *
     * @param Request $request
     * @param Location $location
     * @return JsonResponse
     */
    public function reset(Request $request, Location $location): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Check ownership
        if (!$this->userCanAccessLocation($user, $location)) {
            return response()->json([
                'message' => __('api.locations.not_accessible'),
            ], 404);
        }

        // Delete existing profile
        $location->responseProfile()->delete();

        return response()->json([
            'message' => __('api.response_profile.reset'),
            'profile' => LocationResponseProfile::getDefaults($location),
        ]);
    }

    /**
     * Get the list of business sectors.
     *
     * GET /api/response-profile/sectors
     *
     * @return JsonResponse
     */
    public function sectors(): JsonResponse
    {
        return response()->json([
            'sectors' => BusinessSector::toArray(),
        ]);
    }

    /**
     * Get all available options for response profiles.
     *
     * GET /api/response-profile/options
     *
     * @return JsonResponse
     */
    public function options(): JsonResponse
    {
        return response()->json([
            'sectors' => BusinessSector::toArray(),
            'tones' => ResponseTone::toArray(),
            'lengths' => ResponseLength::toArray(),
            'negativeStrategies' => NegativeStrategy::toArray(),
        ]);
    }

    /**
     * Check if user can access the location.
     *
     * @param User $user
     * @param Location $location
     * @return bool
     */
    private function userCanAccessLocation(User $user, Location $location): bool
    {
        // Direct ownership
        if ($location->user_id === $user->id) {
            return true;
        }

        // Organization access
        if ($user->organization_id && $location->organization_id === $user->organization_id) {
            return true;
        }

        return false;
    }
}
