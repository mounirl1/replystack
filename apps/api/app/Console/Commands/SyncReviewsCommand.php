<?php

namespace App\Console\Commands;

use App\Jobs\SyncExternalReviewsJob;
use App\Jobs\SyncGoogleReviewsJob;
use App\Models\ReviewConnection;
use Illuminate\Console\Command;

class SyncReviewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reviews:sync
                            {--location= : Sync for a specific location ID}
                            {--platform= : Sync only a specific platform (google|apify)}';

    /**
     * The console command description.
     */
    protected $description = 'Dispatch review sync jobs for active connections (Google API or Apify scraping)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locationId = $this->option('location');
        $platform = $this->option('platform');

        if ($platform && !in_array($platform, ['google', 'apify'], true)) {
            $this->error('Invalid platform. Must be "google" or "apify".');
            return self::FAILURE;
        }

        $googleDispatched = 0;
        $apifyDispatched = 0;

        // Google sync
        if ($platform === null || $platform === 'google') {
            $googleDispatched = $this->syncGoogle($locationId);
        }

        // Apify sync (external platforms)
        if ($platform === null || $platform === 'apify') {
            $apifyDispatched = $this->syncApify($locationId);
        }

        $total = $googleDispatched + $apifyDispatched;

        if ($total === 0) {
            $this->info('No connections eligible for sync.');
        } else {
            $this->newLine();
            $this->info("Dispatched {$total} sync jobs (Google: {$googleDispatched}, Apify: {$apifyDispatched}).");
        }

        return self::SUCCESS;
    }

    private function syncGoogle(?string $locationId): int
    {
        $query = ReviewConnection::query()
            ->where('platform', 'google')
            ->active()
            ->whereNotNull('access_token');

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        $connections = $query->get();
        $dispatched = 0;

        foreach ($connections as $connection) {
            if ($connection->isSyncLocked()) {
                $this->line("  ⏭ Skipped (locked): connection #{$connection->id} - {$connection->platform_name}");
                continue;
            }

            SyncGoogleReviewsJob::dispatch($connection);
            $dispatched++;
            $this->line("  → Dispatched Google sync: connection #{$connection->id} - {$connection->platform_name}");
        }

        return $dispatched;
    }

    private function syncApify(?string $locationId): int
    {
        $query = ReviewConnection::query()
            ->active()
            ->apifyEnabled()
            ->whereNotNull('platform_url');

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        $connections = $query->get();
        $dispatched = 0;

        foreach ($connections as $connection) {
            if ($connection->isSyncLocked()) {
                $this->line("  ⏭ Skipped (locked): connection #{$connection->id} - {$connection->platform}");
                continue;
            }

            SyncExternalReviewsJob::dispatch($connection);
            $dispatched++;
            $this->line("  → Dispatched Apify sync: connection #{$connection->id} - {$connection->platform}");
        }

        return $dispatched;
    }
}
