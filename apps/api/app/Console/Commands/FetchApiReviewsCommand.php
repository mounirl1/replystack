<?php

namespace App\Console\Commands;

use App\Jobs\FetchReviewsFromApiJob;
use App\Models\Location;
use Illuminate\Console\Command;

class FetchApiReviewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reviews:fetch-api
                            {--location= : Fetch for a specific location ID}
                            {--platform= : Fetch only from a specific platform (google|facebook)}
                            {--force : Ignore the 12-hour delay between fetches}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch reviews from Google/Facebook APIs for all connected locations';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locationId = $this->option('location');
        $platform = $this->option('platform');
        $force = $this->option('force');

        // Validate platform option
        if ($platform && !in_array($platform, ['google', 'facebook'], true)) {
            $this->error('Invalid platform. Must be "google" or "facebook".');
            return self::FAILURE;
        }

        // Build query for locations with valid API connections
        $query = Location::query()
            ->where('auto_fetch_enabled', true);

        // Filter by specific location if provided
        if ($locationId) {
            $query->where('id', $locationId);
        }

        // Apply 12-hour delay unless forced
        if (!$force) {
            $query->where(function ($q) {
                $q->whereNull('last_api_fetch_at')
                    ->orWhere('last_api_fetch_at', '<', now()->subHours(12));
            });
        }

        // Get locations with at least one valid API connection
        $locations = $query->get()->filter(function (Location $location) use ($platform) {
            if ($platform === 'google') {
                return $location->isGoogleTokenValid();
            }
            if ($platform === 'facebook') {
                return $location->isFacebookTokenValid();
            }
            // Any platform
            return $location->isGoogleTokenValid() || $location->isFacebookTokenValid();
        });

        if ($locations->isEmpty()) {
            $this->info('No locations with valid API connections found.');
            return self::SUCCESS;
        }

        $jobsDispatched = 0;
        $locationsProcessed = 0;

        foreach ($locations as $location) {
            $locationsProcessed++;

            // Dispatch jobs for each connected platform
            if (($platform === null || $platform === 'google') && $location->isGoogleTokenValid()) {
                FetchReviewsFromApiJob::dispatch($location, 'google');
                $jobsDispatched++;
                $this->line("  → Dispatched Google fetch for: {$location->name}");
            }

            if (($platform === null || $platform === 'facebook') && $location->isFacebookTokenValid()) {
                FetchReviewsFromApiJob::dispatch($location, 'facebook');
                $jobsDispatched++;
                $this->line("  → Dispatched Facebook fetch for: {$location->name}");
            }
        }

        $this->newLine();
        $this->info("Dispatched {$jobsDispatched} jobs for {$locationsProcessed} locations.");

        return self::SUCCESS;
    }
}
