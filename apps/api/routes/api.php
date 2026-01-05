<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConnectionController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewSyncController;
use App\Http\Controllers\Api\UserController;
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

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    // Public routes with rate limiting (5 attempts per minute)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'revokeAllTokens']);
        Route::get('/user', [AuthController::class, 'user']);
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
        Route::post('/fetch', [ReviewController::class, 'triggerFetch']);
        Route::post('/sync', [ReviewSyncController::class, 'sync']);
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
        Route::patch('/settings', [UserController::class, 'updateSettings']);
        Route::delete('/', [UserController::class, 'destroy']);
    });

    // Stripe
    Route::post('/stripe/checkout', [App\Http\Controllers\Api\StripeController::class, 'checkout']);
    Route::post('/stripe/portal', [App\Http\Controllers\Api\StripeController::class, 'portal']);

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

// Stripe webhook (no auth, no rate limit)
Route::post('/stripe/webhook', [App\Http\Controllers\Api\StripeController::class, 'webhook']);

// OAuth callbacks (no auth - returning from Google/Facebook)
Route::get('/oauth/google/callback', [OAuthController::class, 'googleCallback']);
Route::get('/oauth/facebook/callback', [OAuthController::class, 'facebookCallback']);
