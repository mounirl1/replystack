<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super Admin Dashboard Controller.
 *
 * Provides endpoints for administrative metrics:
 * - Overview: Key metrics summary
 * - Users: User statistics and trends
 * - Revenue: MRR, ARR, subscription data
 * - AI Costs: Token usage and cost estimates
 * - Trends: Time-series data for various metrics
 */
class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Get dashboard overview with all key metrics.
     *
     * GET /api/super-admin/dashboard/overview
     *
     * @return JsonResponse
     */
    public function overview(): JsonResponse
    {
        $data = $this->dashboardService->getOverview();

        return response()->json($data);
    }

    /**
     * Get detailed user statistics.
     *
     * GET /api/super-admin/dashboard/users
     *
     * Query Parameters:
     * - period: 7d|30d|90d|12m (default: 30d)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function users(Request $request): JsonResponse
    {
        $period = $request->query('period', '30d');

        // Validate period
        if (!in_array($period, ['7d', '30d', '90d', '12m'])) {
            return response()->json([
                'message' => 'Invalid period. Use: 7d, 30d, 90d, or 12m',
            ], 422);
        }

        $data = $this->dashboardService->getUserStats($period);

        return response()->json($data);
    }

    /**
     * Get revenue statistics from Lemon Squeezy.
     *
     * GET /api/super-admin/dashboard/revenue
     *
     * Query Parameters:
     * - period: 7d|30d|90d|12m (default: 30d)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function revenue(Request $request): JsonResponse
    {
        $period = $request->query('period', '30d');

        // Validate period
        if (!in_array($period, ['7d', '30d', '90d', '12m'])) {
            return response()->json([
                'message' => 'Invalid period. Use: 7d, 30d, 90d, or 12m',
            ], 422);
        }

        $data = $this->dashboardService->getRevenueStats($period);

        return response()->json($data);
    }

    /**
     * Get AI costs statistics.
     *
     * GET /api/super-admin/dashboard/ai-costs
     *
     * Query Parameters:
     * - period: 7d|30d|90d|12m (default: 30d)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function aiCosts(Request $request): JsonResponse
    {
        $period = $request->query('period', '30d');

        // Validate period
        if (!in_array($period, ['7d', '30d', '90d', '12m'])) {
            return response()->json([
                'message' => 'Invalid period. Use: 7d, 30d, 90d, or 12m',
            ], 422);
        }

        $data = $this->dashboardService->getAICostsStats($period);

        return response()->json($data);
    }

    /**
     * Get trends data for multiple metrics.
     *
     * GET /api/super-admin/dashboard/trends
     *
     * Query Parameters:
     * - period: day|week|month (default: day)
     * - range: number of periods (default: 30)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trends(Request $request): JsonResponse
    {
        $period = $request->query('period', 'day');
        $range = (int) $request->query('range', 30);

        // Validate period
        if (!in_array($period, ['day', 'week', 'month'])) {
            return response()->json([
                'message' => 'Invalid period. Use: day, week, or month',
            ], 422);
        }

        // Validate range
        if ($range < 1 || $range > 365) {
            return response()->json([
                'message' => 'Range must be between 1 and 365',
            ], 422);
        }

        $data = $this->dashboardService->getTrends($period, $range);

        return response()->json($data);
    }

    /**
     * Clear dashboard caches.
     *
     * POST /api/super-admin/dashboard/clear-cache
     *
     * @return JsonResponse
     */
    public function clearCache(): JsonResponse
    {
        $this->dashboardService->clearCache();

        return response()->json([
            'message' => 'Dashboard caches cleared successfully',
        ]);
    }
}
