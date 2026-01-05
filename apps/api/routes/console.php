<?php

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
