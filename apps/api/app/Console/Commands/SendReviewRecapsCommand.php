<?php

namespace App\Console\Commands;

use App\Models\Location;
use App\Services\Alerts\ReviewAlertService;
use Illuminate\Console\Command;

class SendReviewRecapsCommand extends Command
{
    protected $signature = 'reviews:send-recaps';

    protected $description = 'Send review recap emails to locations with configured recap frequency';

    public function handle(ReviewAlertService $alertService): int
    {
        $today = now();
        $sent = 0;

        // Daily recaps
        Location::where('alert_recap_frequency', 'daily')
            ->where('alerts_enabled', true)
            ->each(function (Location $location) use ($alertService, &$sent) {
                $alertService->sendRecap($location, now()->subDay()->toDateTimeString());
                $sent++;
            });

        // Weekly recaps (on Mondays)
        if ($today->isMonday()) {
            Location::where('alert_recap_frequency', 'weekly')
                ->where('alerts_enabled', true)
                ->each(function (Location $location) use ($alertService, &$sent) {
                    $alertService->sendRecap($location, now()->subWeek()->toDateTimeString());
                    $sent++;
                });
        }

        // Monthly recaps (on 1st of month)
        if ($today->day === 1) {
            Location::where('alert_recap_frequency', 'monthly')
                ->where('alerts_enabled', true)
                ->each(function (Location $location) use ($alertService, &$sent) {
                    $alertService->sendRecap($location, now()->subMonth()->toDateTimeString());
                    $sent++;
                });
        }

        $this->info("Sent {$sent} recap emails.");

        return self::SUCCESS;
    }
}
