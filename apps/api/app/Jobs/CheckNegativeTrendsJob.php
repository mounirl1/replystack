<?php

namespace App\Jobs;

use App\Models\Location;
use App\Services\Monitoring\AlertService;
use App\Services\Sentiment\NegativeTrendService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to check for negative trends across all locations with alerts enabled.
 *
 * This job runs periodically (via scheduler) to analyze sentiment trends
 * and send alerts when negative patterns are detected.
 */
class CheckNegativeTrendsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('alerts');
    }

    /**
     * Execute the job.
     */
    public function handle(
        NegativeTrendService $trendService,
        AlertService $alertService
    ): void {
        Log::info('CheckNegativeTrendsJob: Starting trend analysis');

        $locations = Location::withNegativeTrendAlerts()->get();
        $alertsSent = 0;
        $locationsAnalyzed = 0;

        foreach ($locations as $location) {
            try {
                // Skip if cooldown hasn't expired
                if (!$location->canSendTrendAlert()) {
                    continue;
                }

                $locationsAnalyzed++;

                // Analyze trends
                $result = $trendService->analyze($location);

                // Send alert if triggered
                if ($result->alertTriggered) {
                    $alertService->sendNegativeTrendAlert($location, $result);
                    $alertsSent++;

                    Log::info('CheckNegativeTrendsJob: Alert sent', [
                        'location_id' => $location->id,
                        'location_name' => $location->name,
                        'trend' => $result->trend,
                        'negative_count' => $result->negativeReviewsCount,
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('CheckNegativeTrendsJob: Error analyzing location', [
                    'location_id' => $location->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('CheckNegativeTrendsJob: Completed', [
            'locations_analyzed' => $locationsAnalyzed,
            'alerts_sent' => $alertsSent,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('CheckNegativeTrendsJob: Failed permanently', [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<string>
     */
    public function tags(): array
    {
        return ['negative-trends', 'alerts'];
    }
}
