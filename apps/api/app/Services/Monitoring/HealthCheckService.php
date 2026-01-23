<?php

namespace App\Services\Monitoring;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

/**
 * Service for performing health checks on various system components.
 */
class HealthCheckService
{
    /**
     * Status constants.
     */
    public const STATUS_HEALTHY = 'healthy';
    public const STATUS_DEGRADED = 'degraded';
    public const STATUS_UNHEALTHY = 'unhealthy';

    /**
     * Run all health checks.
     *
     * @return HealthCheckResult
     */
    public function checkAll(): HealthCheckResult
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ];

        // Optionally check external services
        if (config('services.gemini.api_key')) {
            $checks['gemini_api'] = $this->checkGeminiApi();
        }

        return new HealthCheckResult($checks);
    }

    /**
     * Check database connectivity.
     */
    public function checkDatabase(): array
    {
        $start = microtime(true);

        try {
            DB::connection()->getPdo();
            $latency = round((microtime(true) - $start) * 1000, 2);

            // Check if latency is acceptable (< 100ms)
            $status = $latency < 100 ? self::STATUS_HEALTHY : self::STATUS_DEGRADED;

            return [
                'status' => $status,
                'latency_ms' => $latency,
                'connection' => config('database.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connectivity.
     */
    public function checkRedis(): array
    {
        // Skip if Redis is not configured
        if (config('database.redis.client') === null) {
            return [
                'status' => self::STATUS_HEALTHY,
                'skipped' => true,
                'reason' => 'Redis not configured',
            ];
        }

        $start = microtime(true);

        try {
            Redis::ping();
            $latency = round((microtime(true) - $start) * 1000, 2);

            $status = $latency < 50 ? self::STATUS_HEALTHY : self::STATUS_DEGRADED;

            return [
                'status' => $status,
                'latency_ms' => $latency,
            ];
        } catch (\Error $e) {
            // Handle cases like "Class Redis not found"
            return [
                'status' => self::STATUS_HEALTHY,
                'skipped' => true,
                'reason' => 'Redis extension not available',
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check cache functionality.
     */
    public function checkCache(): array
    {
        $start = microtime(true);
        $testKey = 'health_check_' . uniqid();
        $testValue = 'test_value_' . time();

        try {
            // Write test
            Cache::put($testKey, $testValue, 60);

            // Read test
            $retrieved = Cache::get($testKey);

            // Cleanup
            Cache::forget($testKey);

            $latency = round((microtime(true) - $start) * 1000, 2);

            if ($retrieved !== $testValue) {
                return [
                    'status' => self::STATUS_UNHEALTHY,
                    'error' => 'Cache read/write mismatch',
                ];
            }

            return [
                'status' => self::STATUS_HEALTHY,
                'latency_ms' => $latency,
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check queue health.
     */
    public function checkQueue(): array
    {
        try {
            $connection = config('queue.default');
            $queueSize = Queue::size();

            // Check for failed jobs
            $failedCount = DB::table('failed_jobs')->count();

            $status = self::STATUS_HEALTHY;

            // Degrade if queue is backing up (> 100 jobs)
            if ($queueSize > 100) {
                $status = self::STATUS_DEGRADED;
            }

            // Degrade if there are failed jobs
            if ($failedCount > 0) {
                $status = self::STATUS_DEGRADED;
            }

            return [
                'status' => $status,
                'connection' => $connection,
                'pending_jobs' => $queueSize,
                'failed_jobs' => $failedCount,
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check storage write access.
     */
    public function checkStorage(): array
    {
        $testFile = storage_path('app/health_check_test.txt');

        try {
            // Write test
            file_put_contents($testFile, 'health_check_' . time());

            // Read test
            $content = file_get_contents($testFile);

            // Cleanup
            unlink($testFile);

            if (empty($content)) {
                return [
                    'status' => self::STATUS_UNHEALTHY,
                    'error' => 'Storage read/write failed',
                ];
            }

            return [
                'status' => self::STATUS_HEALTHY,
                'writable' => true,
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check Gemini API availability.
     */
    public function checkGeminiApi(): array
    {
        $start = microtime(true);

        try {
            $apiKey = config('services.gemini.api_key');
            $model = config('services.gemini.model', 'gemini-2.0-flash');

            // Simple API call to check connectivity
            $response = Http::timeout(5)->get(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}",
                ['key' => $apiKey]
            );

            $latency = round((microtime(true) - $start) * 1000, 2);

            if ($response->successful()) {
                return [
                    'status' => self::STATUS_HEALTHY,
                    'latency_ms' => $latency,
                    'model' => $model,
                ];
            }

            return [
                'status' => self::STATUS_DEGRADED,
                'latency_ms' => $latency,
                'http_status' => $response->status(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => self::STATUS_UNHEALTHY,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get system metrics.
     */
    public function getSystemMetrics(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'memory_peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'uptime' => $this->getUptime(),
        ];
    }

    /**
     * Get application uptime.
     */
    private function getUptime(): ?string
    {
        $startTime = Cache::get('app_start_time');

        if (!$startTime) {
            Cache::put('app_start_time', now(), now()->addYear());
            return null;
        }

        return $startTime->diffForHumans(now(), true);
    }
}
