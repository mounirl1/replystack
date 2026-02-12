<?php

use App\Jobs\CheckNegativeTrendsJob;
use App\Services\Monitoring\AlertService;
use App\Services\Monitoring\HealthCheckService;
use App\Services\Quota\QuotaService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
*/

// Reset monthly quotas on the 1st of each month for free and starter plan users
Schedule::call(function () {
    $count = app(QuotaService::class)->resetMonthlyQuotas();
    info("Monthly quotas reset for {$count} users");
})->monthlyOn(1, '00:00')->name('quota:reset-monthly')->withoutOverlapping();

// Fetch reviews from Google/Facebook APIs twice daily (6h and 18h)
Schedule::command('reviews:fetch-api')
    ->twiceDaily(6, 18)
    ->name('reviews:fetch-api')
    ->withoutOverlapping()
    ->onOneServer();

// Health monitoring - run every 5 minutes, send alerts if unhealthy
Schedule::command('monitor:health --alert')
    ->everyFiveMinutes()
    ->name('monitor:health')
    ->withoutOverlapping()
    ->onOneServer()
    ->runInBackground();

// Negative trend alerts - run every hour to check for declining sentiment
Schedule::job(new CheckNegativeTrendsJob())
    ->hourly()
    ->name('alerts:negative-trends')
    ->withoutOverlapping()
    ->onOneServer();

// Sync Google reviews every hour via ReviewConnection-based sync
Schedule::command('reviews:sync --platform=google')
    ->hourly()
    ->name('reviews:sync-google')
    ->withoutOverlapping()
    ->onOneServer();

// Sync external reviews (Apify: TripAdvisor, Booking, Airbnb) every 6 hours
Schedule::command('reviews:sync --platform=apify')
    ->everySixHours()
    ->name('reviews:sync-apify')
    ->withoutOverlapping()
    ->onOneServer();

// Review recap emails - daily at 08:00
Schedule::command('reviews:send-recaps')
    ->dailyAt('08:00')
    ->name('reviews:send-recaps')
    ->withoutOverlapping()
    ->onOneServer();

/*
|--------------------------------------------------------------------------
| Manual Artisan Commands
|--------------------------------------------------------------------------
*/

// Manual command to reset monthly quotas
Artisan::command('quota:reset-monthly', function () {
    $count = app(QuotaService::class)->resetMonthlyQuotas();
    $this->info("Monthly quotas reset for {$count} users.");
})->purpose('Reset monthly quotas for all free and starter plan users');

// Command to view quota statistics
Artisan::command('quota:stats', function () {
    $stats = app(QuotaService::class)->getQuotaStatistics();

    $this->info('Quota Statistics');
    $this->line('================');
    $this->line("Total users: {$stats['total_users']}");
    $this->line("Users with exhausted quota: {$stats['quota_exhausted']}");
    $this->newLine();

    $this->info('Users by Plan:');
    foreach ($stats['by_plan'] as $plan => $count) {
        $this->line("  {$plan}: {$count}");
    }
    $this->newLine();

    $this->info('Average Usage:');
    $this->line("  Free plan: {$stats['average_usage']['free']}%");
    $this->line("  Starter plan: {$stats['average_usage']['starter']}%");
})->purpose('Display quota usage statistics');
