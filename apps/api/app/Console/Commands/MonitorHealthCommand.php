<?php

namespace App\Console\Commands;

use App\Services\Monitoring\AlertService;
use App\Services\Monitoring\HealthCheckService;
use Illuminate\Console\Command;

/**
 * Command to run health checks and send alerts if issues are detected.
 */
class MonitorHealthCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'monitor:health
        {--alert : Send alerts if issues are detected}
        {--json : Output results as JSON}';

    /**
     * The console command description.
     */
    protected $description = 'Run health checks on all system components';

    public function __construct(
        private readonly HealthCheckService $healthCheckService,
        private readonly AlertService $alertService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Running health checks...');

        $result = $this->healthCheckService->checkAll();

        if ($this->option('json')) {
            $this->line(json_encode($result->toArray(), JSON_PRETTY_PRINT));

            return $result->isHealthy() ? self::SUCCESS : self::FAILURE;
        }

        // Display results in a table
        $rows = [];
        foreach ($result->checks as $name => $check) {
            $status = $check['status'] ?? 'unknown';
            $statusIcon = match ($status) {
                HealthCheckService::STATUS_HEALTHY => '<fg=green>✓</>',
                HealthCheckService::STATUS_DEGRADED => '<fg=yellow>⚠</>',
                HealthCheckService::STATUS_UNHEALTHY => '<fg=red>✗</>',
                default => '?',
            };

            $details = $this->formatCheckDetails($check);

            $rows[] = [$statusIcon, ucfirst($name), $status, $details];
        }

        $this->table(
            ['', 'Component', 'Status', 'Details'],
            $rows
        );

        // Summary
        $this->newLine();
        $summaryColor = match ($result->status) {
            HealthCheckService::STATUS_HEALTHY => 'green',
            HealthCheckService::STATUS_DEGRADED => 'yellow',
            default => 'red',
        };

        $this->line(sprintf(
            '<fg=%s>Overall Status: %s</>',
            $summaryColor,
            strtoupper($result->status)
        ));

        $this->line(sprintf(
            'Healthy: %d | Degraded: %d | Unhealthy: %d',
            $result->healthyCount,
            $result->degradedCount,
            $result->unhealthyCount
        ));

        // Send alert if requested and there are issues
        if ($this->option('alert') && !$result->isHealthy()) {
            $this->alertService->sendHealthAlert($result);
            $this->info('Alert sent to configured channels.');
        }

        return $result->isHealthy() ? self::SUCCESS : self::FAILURE;
    }

    /**
     * Format check details for display.
     */
    private function formatCheckDetails(array $check): string
    {
        $details = [];

        if (isset($check['latency_ms'])) {
            $details[] = "{$check['latency_ms']}ms";
        }

        if (isset($check['error'])) {
            $details[] = $check['error'];
        }

        if (isset($check['pending_jobs'])) {
            $details[] = "pending: {$check['pending_jobs']}";
        }

        if (isset($check['failed_jobs']) && $check['failed_jobs'] > 0) {
            $details[] = "failed: {$check['failed_jobs']}";
        }

        return implode(', ', $details) ?: '-';
    }
}
