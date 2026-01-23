<?php

namespace App\Providers;

use App\Models\Review;
use App\Observers\ReviewAlertObserver;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configureScramble();
        $this->registerObservers();
    }

    /**
     * Register model observers.
     */
    protected function registerObservers(): void
    {
        Review::observe(ReviewAlertObserver::class);
    }

    /**
     * Configure Scramble OpenAPI documentation.
     */
    protected function configureScramble(): void
    {
        Scramble::afterOpenApiGenerated(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'JWT')
                    ->setDescription('Utilisez le token obtenu via /api/auth/login')
            );
        });
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Rate limiter for Gemini sentiment analysis
        // Max 10 calls per second to avoid hitting API limits
        RateLimiter::for('gemini-sentiment', function () {
            return Limit::perSecond(10);
        });
    }
}
