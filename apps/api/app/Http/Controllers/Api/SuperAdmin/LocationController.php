<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super Admin Location Controller.
 *
 * Provides endpoints for listing and managing all locations as super admin.
 */
class LocationController extends Controller
{
    /**
     * List all locations with pagination, search, and sorting.
     *
     * GET /api/super-admin/locations
     *
     * Query Parameters:
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 15, max: 50)
     * - search: Search on name, address, or owner email
     * - sort_by: Sort field - name, created_at, reviews_count (default: created_at)
     * - sort_order: asc or desc (default: desc)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 15), 50);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');

        // Validate sort parameters
        $allowedSortBy = ['name', 'created_at', 'reviews_count'];
        $sortBy = in_array($sortBy, $allowedSortBy) ? $sortBy : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query = Location::with(['user:id,name,email,plan'])
            ->withCount('reviews');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        if ($sortBy === 'reviews_count') {
            $query->orderBy('reviews_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $locations = $query->paginate($perPage);

        // Transform the data
        $data = $locations->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'created_at' => $location->created_at->toISOString(),
                'reviews_count' => $location->reviews_count,
                'user' => $location->user ? [
                    'id' => $location->user->id,
                    'name' => $location->user->name,
                    'email' => $location->user->email,
                    'plan' => $location->user->plan,
                ] : null,
                'platforms' => [
                    'google' => $location->hasPlatformConnected('google'),
                    'tripadvisor' => $location->hasPlatformConnected('tripadvisor'),
                    'booking' => $location->hasPlatformConnected('booking'),
                    'yelp' => $location->hasPlatformConnected('yelp'),
                    'facebook' => $location->hasPlatformConnected('facebook'),
                ],
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $locations->currentPage(),
                'last_page' => $locations->lastPage(),
                'total' => $locations->total(),
                'from' => $locations->firstItem(),
                'to' => $locations->lastItem(),
            ],
        ]);
    }
}
