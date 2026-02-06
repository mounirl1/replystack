<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConnectionController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\GoogleBusinessController;
use App\Http\Controllers\Api\LemonSqueezyController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewSummaryController;
use App\Http\Controllers\Api\ReviewSyncController;
use App\Http\Controllers\Api\SentimentController;
use App\Http\Controllers\Api\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\Api\SuperAdmin\LocationController as SuperAdminLocationController;
use App\Http\Controllers\Api\SuperAdmin\ReviewConnectionController as SuperAdminReviewConnectionController;
use App\Http\Controllers\Api\TriggerFlowController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Webhook\ApifyWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them
| will be assigned to the "api" middleware group.
|
*/

// API Status
Route::get('/', function () {
    return response()->json([
        'name' => 'ReplyStack API',
        'version' => '1.0.0',
        'status' => 'operational',
    ]);
});

// Health check endpoints
Route::get('/health', [MonitoringController::class, 'health']);
Route::get('/health/detailed', [MonitoringController::class, 'healthDetailed']);
Route::get('/health/metrics', [MonitoringController::class, 'metrics']);

// Contact form (public, rate limited to prevent spam)
Route::post('/contact', [ContactController::class, 'send'])
    ->middleware('throttle:5,1');

// Authentication routes
Route::prefix('auth')->group(function () {
    // Public routes with rate limiting (5 attempts per minute)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Magic token validation (public, one-time use)
    Route::get('/magic-token/{token}', [AuthController::class, 'validateMagicToken']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'revokeAllTokens']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/magic-token', [AuthController::class, 'createMagicToken']);
    });
});

// Protected routes
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Replies - with quota check and stricter rate limiting
    Route::middleware(['throttle:20,1', 'quota'])->group(function () {
        Route::post('/replies/generate', [App\Http\Controllers\Api\ReplyController::class, 'generate']);
    });
    Route::get('/replies', [App\Http\Controllers\Api\ReplyController::class, 'index']);
    Route::get('/replies/{id}', [App\Http\Controllers\Api\ReplyController::class, 'show']);

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::get('/stats', [ReviewController::class, 'stats']);
        Route::get('/summary', [ReviewSummaryController::class, 'show']);
        Route::post('/summarize', [ReviewSummaryController::class, 'generate'])->middleware('quota');
        Route::post('/fetch', [ReviewController::class, 'triggerFetch']);
        Route::post('/sync', [ReviewSyncController::class, 'sync']);

        // Sentiment Analytics (STORY-002)
        Route::prefix('sentiment')->group(function () {
            Route::get('/summary', [SentimentController::class, 'summary']);
            Route::get('/trends', [SentimentController::class, 'trends']);
            Route::get('/themes', [SentimentController::class, 'themes']);
        });

        Route::get('/{review}', [ReviewController::class, 'show']);
        Route::patch('/{review}/status', [ReviewController::class, 'updateStatus']);
        Route::post('/{review}/publish', [ReviewController::class, 'publish']);
    });

    // Extraction tasks for extension (before apiResource to avoid conflict)
    Route::get('/locations/extraction-tasks', [ReviewSyncController::class, 'extractionTasks']);

    // Locations
    Route::apiResource('locations', App\Http\Controllers\Api\LocationController::class);
    Route::post('/locations/{id}/sync', [App\Http\Controllers\Api\LocationController::class, 'sync']);

    // Location Connections
    Route::get('/locations/{location}/connections', [ConnectionController::class, 'index']);
    Route::put('/locations/{location}/management-urls', [ConnectionController::class, 'updateManagementUrls']);
    Route::put('/locations/{location}/auto-fetch', [ConnectionController::class, 'toggleAutoFetch']);

    // Location Alert Settings (Pro+ plan required)
    Route::get('/locations/{location}/alerts', [App\Http\Controllers\Api\LocationController::class, 'getAlertSettings']);
    Route::put('/locations/{location}/alerts', [App\Http\Controllers\Api\LocationController::class, 'updateAlertSettings']);
    Route::get('/locations/{location}/trend-analysis', [App\Http\Controllers\Api\LocationController::class, 'getTrendAnalysis']);

    // Response Profiles
    Route::get('/locations/{location}/response-profile', [App\Http\Controllers\Api\ResponseProfileController::class, 'show']);
    Route::post('/locations/{location}/response-profile', [App\Http\Controllers\Api\ResponseProfileController::class, 'store']);
    Route::post('/locations/{location}/response-profile/reset', [App\Http\Controllers\Api\ResponseProfileController::class, 'reset']);
    Route::get('/response-profile/options', [App\Http\Controllers\Api\ResponseProfileController::class, 'options']);
    Route::get('/response-profile/sectors', [App\Http\Controllers\Api\ResponseProfileController::class, 'sectors']);

    // User
    Route::prefix('user')->group(function () {
        Route::get('/quota', [UserController::class, 'quota']);
        Route::get('/usage', [UserController::class, 'usage']);
        Route::get('/response-style-status', [UserController::class, 'responseStyleStatus']);
        Route::patch('/settings', [UserController::class, 'updateSettings']);
        Route::get('/ai-providers', [UserController::class, 'getAiProviders']);
        Route::patch('/ai-provider', [UserController::class, 'updateAiProvider']);
        Route::delete('/', [UserController::class, 'destroy']);
    });

    // LemonSqueezy
    Route::post('/lemonsqueezy/checkout', [LemonSqueezyController::class, 'checkout']);
    Route::post('/lemonsqueezy/portal', [LemonSqueezyController::class, 'portal']);

    // OAuth - Protected routes (initiate and disconnect)
    Route::prefix('oauth')->group(function () {
        // Google
        Route::get('/google/{location}', [OAuthController::class, 'googleRedirect']);
        Route::delete('/google/{location}', [OAuthController::class, 'googleDisconnect']);

        // Facebook
        Route::get('/facebook/{location}', [OAuthController::class, 'facebookRedirect']);
        Route::delete('/facebook/{location}', [OAuthController::class, 'facebookDisconnect']);
    });
});

// LemonSqueezy webhook (no auth, no rate limit)
Route::post('/lemonsqueezy/webhook', [LemonSqueezyController::class, 'webhook']);

// OAuth callbacks (no auth - returning from Google/Facebook)
Route::get('/oauth/google/callback', [OAuthController::class, 'googleCallback']);
Route::get('/oauth/facebook/callback', [OAuthController::class, 'facebookCallback']);

// =============================================================================
// TriggerFlow Integration Routes
// =============================================================================
// These routes are authenticated via TriggerFlow token validation
Route::middleware(['triggerflow.auth', 'throttle:60,1'])->prefix('triggerflow')->group(function () {
    // Location management
    Route::post('/locations/sync', [TriggerFlowController::class, 'syncLocation']);
    Route::delete('/locations/{externalId}', [TriggerFlowController::class, 'deleteLocation']);

    // Reviews
    Route::get('/locations/{externalId}/reviews', [TriggerFlowController::class, 'getReviews']);
    Route::get('/locations/{externalId}/stats', [TriggerFlowController::class, 'getStats']);

    // Connections
    Route::get('/locations/{externalId}/connections', [TriggerFlowController::class, 'getConnections']);
    Route::post('/locations/{externalId}/connections', [TriggerFlowController::class, 'createConnection']);

    // Reply generation (with quota check)
    Route::middleware('quota')->post('/replies/generate', [TriggerFlowController::class, 'generateReply']);

    // Google OAuth
    Route::get('/google/auth-url', [TriggerFlowController::class, 'getGoogleAuthUrl']);
    Route::post('/google/callback', [TriggerFlowController::class, 'handleGoogleCallback']);
});

// =============================================================================
// Google Business Profile Routes
// =============================================================================
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('google-business')->group(function () {
    Route::get('/{connection}/accounts', [GoogleBusinessController::class, 'getAccounts']);
    Route::get('/{connection}/locations', [GoogleBusinessController::class, 'getLocations']);
    Route::post('/{connection}/select', [GoogleBusinessController::class, 'selectLocation']);
    Route::post('/{connection}/sync', [GoogleBusinessController::class, 'syncReviews']);
    Route::delete('/{connection}', [GoogleBusinessController::class, 'disconnect']);
    Route::get('/{connection}/status', [GoogleBusinessController::class, 'status']);
});

// =============================================================================
// Super Admin Routes
// =============================================================================
Route::middleware(['auth:sanctum', 'super-admin', 'throttle:60,1'])->prefix('super-admin')->group(function () {
    // Dashboard (STORY-009)
    Route::prefix('dashboard')->group(function () {
        Route::get('/overview', [SuperAdminDashboardController::class, 'overview']);
        Route::get('/users', [SuperAdminDashboardController::class, 'users']);
        Route::get('/revenue', [SuperAdminDashboardController::class, 'revenue']);
        Route::get('/ai-costs', [SuperAdminDashboardController::class, 'aiCosts']);
        Route::get('/trends', [SuperAdminDashboardController::class, 'trends']);
        Route::post('/clear-cache', [SuperAdminDashboardController::class, 'clearCache']);
    });

    // Locations list
    Route::get('/locations', [SuperAdminLocationController::class, 'index']);

    // Location connections
    Route::get('/locations/{location}/connections', [SuperAdminReviewConnectionController::class, 'index']);

    // Connection management
    Route::patch('/connections/{connection}/apify', [SuperAdminReviewConnectionController::class, 'toggleApify']);
    Route::post('/connections/{connection}/scrape', [SuperAdminReviewConnectionController::class, 'triggerScrape']);

    // Apify management
    Route::get('/apify-connections', [SuperAdminReviewConnectionController::class, 'listApifyConnections']);
    Route::get('/apify-requests', [SuperAdminReviewConnectionController::class, 'listApifyRequests']);
    Route::get('/apify-requests/{apifyRequest}', [SuperAdminReviewConnectionController::class, 'showApifyRequest']);
    Route::get('/apify-stats', [SuperAdminReviewConnectionController::class, 'apifyStats']);
});

// =============================================================================
// Webhooks (no auth, signature verified in controller)
// =============================================================================
Route::post('/webhooks/apify', [ApifyWebhookController::class, 'handle']);
