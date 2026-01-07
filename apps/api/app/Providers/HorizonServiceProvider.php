<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        // Horizon::routeSmsNotificationsTo('15556667777');
        // Horizon::routeMailNotificationsTo('example@example.com');
        // Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    }

    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user = null) {
            // Allow access if no user is required (local environment)
            if (app()->environment('local')) {
                return true;
            }

            // Require authenticated user in production
            if (!$user) {
                return false;
            }

            // Allow enterprise plan users
            if (in_array($user->plan, ['enterprise'])) {
                return true;
            }

            // Allow admin emails from config
            $admins = config('horizon.admins', []);
            return in_array($user->email, $admins);
        });
    }
}
