<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Monitoring\HealthCheckService;
use Illuminate\Http\JsonResponse;

/**
 * Controller for monitoring and health check endpoints.
 */
class MonitoringController extends Controller
{
    public function __construct(
        private readonly HealthCheckService $healthCheckService
    ) {}

    /**
     * Simple health check for load balancers and uptime monitors.
     *
     * Returns 200 if the application is running.
     * This endpoint does NOT check dependencies.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Detailed health check for all system components.
     *
     * Checks database, Redis, cache, queue, storage, and external APIs.
     * Returns appropriate HTTP status based on overall health.
     */
    public function healthDetailed(): JsonResponse
    {
        $result = $this->healthCheckService->checkAll();

        return response()
            ->json($result->toArray())
            ->setStatusCode($result->getHttpStatusCode());
    }

    /**
     * System metrics endpoint.
     *
     * Returns PHP version, memory usage, and other system metrics.
     */
    public function metrics(): JsonResponse
    {
        $metrics = $this->healthCheckService->getSystemMetrics();

        return response()->json([
            'timestamp' => now()->toIso8601String(),
            'metrics' => $metrics,
        ]);
    }
}
