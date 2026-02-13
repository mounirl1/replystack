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

        $frequenciesToProcess = [
            'daily' => now()->subDay(),
        ];

        if ($today->isMonday()) {
            $frequenciesToProcess['weekly'] = now()->subWeek();
        }

        if ($today->day === 1) {
            $frequenciesToProcess['monthly'] = now()->subMonth();
        }

        foreach ($frequenciesToProcess as $frequency => $since) {
            Location::where('alert_recap_frequency', $frequency)
                ->where('alerts_enabled', true)
                ->each(function (Location $location) use ($alertService, $since, &$sent) {
                    $alertService->sendRecap($location, $since->toDateTimeString());
                    $sent++;
                });
        }

        $this->info("Sent {$sent} recap emails.");

        return self::SUCCESS;
    }
}
