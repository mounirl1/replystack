<?php

namespace App\Services\Monitoring;

/**
 * Data Transfer Object for health check results.
 */
readonly class HealthCheckResult
{
    public string $status;
    public array $checks;
    public int $healthyCount;
    public int $degradedCount;
    public int $unhealthyCount;

    public function __construct(array $checks)
    {
        $this->checks = $checks;

        $this->healthyCount = $this->countByStatus(HealthCheckService::STATUS_HEALTHY);
        $this->degradedCount = $this->countByStatus(HealthCheckService::STATUS_DEGRADED);
        $this->unhealthyCount = $this->countByStatus(HealthCheckService::STATUS_UNHEALTHY);

        $this->status = $this->determineOverallStatus();
    }

    /**
     * Count checks by status.
     */
    private function countByStatus(string $status): int
    {
        return collect($this->checks)
            ->filter(fn ($check) => ($check['status'] ?? '') === $status)
            ->count();
    }

    /**
     * Determine overall system status.
     */
    private function determineOverallStatus(): string
    {
        if ($this->unhealthyCount > 0) {
            return HealthCheckService::STATUS_UNHEALTHY;
        }

        if ($this->degradedCount > 0) {
            return HealthCheckService::STATUS_DEGRADED;
        }

        return HealthCheckService::STATUS_HEALTHY;
    }

    /**
     * Check if system is healthy.
     */
    public function isHealthy(): bool
    {
        return $this->status === HealthCheckService::STATUS_HEALTHY;
    }

    /**
     * Check if system is degraded.
     */
    public function isDegraded(): bool
    {
        return $this->status === HealthCheckService::STATUS_DEGRADED;
    }

    /**
     * Check if system is unhealthy.
     */
    public function isUnhealthy(): bool
    {
        return $this->status === HealthCheckService::STATUS_UNHEALTHY;
    }

    /**
     * Get failed checks (unhealthy or degraded).
     */
    public function getFailedChecks(): array
    {
        return collect($this->checks)
            ->filter(fn ($check) => ($check['status'] ?? '') !== HealthCheckService::STATUS_HEALTHY)
            ->all();
    }

    /**
     * Get HTTP status code for response.
     */
    public function getHttpStatusCode(): int
    {
        return match ($this->status) {
            HealthCheckService::STATUS_HEALTHY => 200,
            HealthCheckService::STATUS_DEGRADED => 200,
            HealthCheckService::STATUS_UNHEALTHY => 503,
        };
    }

    /**
     * Convert to array.
     */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'timestamp' => now()->toIso8601String(),
            'summary' => [
                'healthy' => $this->healthyCount,
                'degraded' => $this->degradedCount,
                'unhealthy' => $this->unhealthyCount,
            ],
            'checks' => $this->checks,
        ];
    }
}
