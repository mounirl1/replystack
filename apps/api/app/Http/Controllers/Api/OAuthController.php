<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    // ==================== GOOGLE ====================

    /**
     * Redirect to Google OAuth.
     *
     * GET /api/oauth/google/{location}
     */
    public function googleRedirect(Request $request, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request->user(), $location);

        // Generate state with encrypted location_id
        $state = Crypt::encryptString(json_encode([
            'location_id' => $location->id,
            'user_id' => $request->user()->id,
            'nonce' => Str::random(32),
        ]));

        $params = [
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/business.manage',
            'access_type' => 'offline',
            'prompt' => 'consent', // Force consent to get refresh_token
            'state' => $state,
        ];

        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

        return redirect()->away($url);
    }

    /**
     * Handle Google OAuth callback.
     *
     * GET /api/oauth/google/callback
     */
    public function googleCallback(Request $request): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        // Check for errors
        if ($request->has('error')) {
            Log::warning('Google OAuth error', [
                'error' => $request->get('error'),
                'error_description' => $request->get('error_description'),
            ]);

            return redirect()->away("{$frontendUrl}/settings?oauth=google&status=error&message=" . urlencode($request->get('error_description', 'OAuth cancelled')));
        }

        // Validate state
        try {
            $state = json_decode(Crypt::decryptString($request->get('state')), true);
            $locationId = $state['location_id'] ?? null;
            $userId = $state['user_id'] ?? null;
        } catch (\Exception $e) {
            Log::error('Google OAuth: Invalid state', ['error' => $e->getMessage()]);
            return redirect()->away("{$frontendUrl}/settings?oauth=google&status=error&message=invalid_state");
        }

        if (!$locationId) {
            return redirect()->away("{$frontendUrl}/settings?oauth=google&status=error&message=missing_location");
        }

        $location = Location::find($locationId);

        if (!$location) {
            return redirect()->away("{$frontendUrl}/settings?oauth=google&status=error&message=location_not_found");
        }

        // Exchange code for tokens
        $code = $request->get('code');

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);

        if ($response->failed()) {
            Log::error('Google OAuth: Token exchange failed', [
                'location_id' => $locationId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return redirect()->away("{$frontendUrl}/settings?oauth=google&status=error&message=token_exchange_failed");
        }

        $tokens = $response->json();

        // Store tokens
        $location->update([
            'google_access_token' => $tokens['access_token'],
            'google_refresh_token' => $tokens['refresh_token'] ?? $location->google_refresh_token,
            'google_token_expires_at' => now()->addSeconds($tokens['expires_in'] ?? 3600),
        ]);

        Log::info('Google OAuth: Connected successfully', [
            'location_id' => $locationId,
            'user_id' => $userId,
        ]);

        return redirect()->away("{$frontendUrl}/settings?oauth=google&status=success");
    }

    /**
     * Disconnect Google OAuth.
     *
     * DELETE /api/oauth/google/{location}
     */
    public function googleDisconnect(Request $request, Location $location): JsonResponse
    {
        $this->authorizeLocation($request->user(), $location);

        $location->update([
            'google_access_token' => null,
            'google_refresh_token' => null,
            'google_token_expires_at' => null,
        ]);

        Log::info('Google OAuth: Disconnected', [
            'location_id' => $location->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Google déconnecté avec succès.',
        ]);
    }

    // ==================== FACEBOOK ====================

    /**
     * Redirect to Facebook OAuth.
     *
     * GET /api/oauth/facebook/{location}
     */
    public function facebookRedirect(Request $request, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request->user(), $location);

        // Generate state with encrypted location_id
        $state = Crypt::encryptString(json_encode([
            'location_id' => $location->id,
            'user_id' => $request->user()->id,
            'nonce' => Str::random(32),
        ]));

        $params = [
            'client_id' => config('services.facebook.client_id'),
            'redirect_uri' => config('services.facebook.redirect'),
            'response_type' => 'code',
            'scope' => 'pages_read_engagement,pages_manage_metadata,pages_read_user_content',
            'state' => $state,
        ];

        $url = 'https://www.facebook.com/v18.0/dialog/oauth?' . http_build_query($params);

        return redirect()->away($url);
    }

    /**
     * Handle Facebook OAuth callback.
     *
     * GET /api/oauth/facebook/callback
     */
    public function facebookCallback(Request $request): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        // Check for errors
        if ($request->has('error')) {
            Log::warning('Facebook OAuth error', [
                'error' => $request->get('error'),
                'error_description' => $request->get('error_description'),
            ]);

            return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=error&message=" . urlencode($request->get('error_description', 'OAuth cancelled')));
        }

        // Validate state
        try {
            $state = json_decode(Crypt::decryptString($request->get('state')), true);
            $locationId = $state['location_id'] ?? null;
            $userId = $state['user_id'] ?? null;
        } catch (\Exception $e) {
            Log::error('Facebook OAuth: Invalid state', ['error' => $e->getMessage()]);
            return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=error&message=invalid_state");
        }

        if (!$locationId) {
            return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=error&message=missing_location");
        }

        $location = Location::find($locationId);

        if (!$location) {
            return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=error&message=location_not_found");
        }

        // Exchange code for short-lived token
        $code = $request->get('code');

        $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'redirect_uri' => config('services.facebook.redirect'),
            'code' => $code,
        ]);

        if ($response->failed()) {
            Log::error('Facebook OAuth: Token exchange failed', [
                'location_id' => $locationId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=error&message=token_exchange_failed");
        }

        $shortLivedToken = $response->json('access_token');

        // Exchange for long-lived token
        $longLivedResponse = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'fb_exchange_token' => $shortLivedToken,
        ]);

        if ($longLivedResponse->failed()) {
            Log::warning('Facebook OAuth: Long-lived token exchange failed, using short-lived', [
                'location_id' => $locationId,
            ]);

            // Use short-lived token as fallback
            $accessToken = $shortLivedToken;
            $expiresAt = now()->addHours(2);
        } else {
            $tokens = $longLivedResponse->json();
            $accessToken = $tokens['access_token'];
            $expiresAt = isset($tokens['expires_in'])
                ? now()->addSeconds($tokens['expires_in'])
                : now()->addDays(60);
        }

        // Store token
        $location->update([
            'facebook_access_token' => $accessToken,
            'facebook_token_expires_at' => $expiresAt,
        ]);

        Log::info('Facebook OAuth: Connected successfully', [
            'location_id' => $locationId,
            'user_id' => $userId,
        ]);

        return redirect()->away("{$frontendUrl}/settings?oauth=facebook&status=success");
    }

    /**
     * Disconnect Facebook OAuth.
     *
     * DELETE /api/oauth/facebook/{location}
     */
    public function facebookDisconnect(Request $request, Location $location): JsonResponse
    {
        $this->authorizeLocation($request->user(), $location);

        $location->update([
            'facebook_access_token' => null,
            'facebook_token_expires_at' => null,
        ]);

        Log::info('Facebook OAuth: Disconnected', [
            'location_id' => $location->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facebook déconnecté avec succès.',
        ]);
    }

    // ==================== HELPERS ====================

    /**
     * Verify user has access to the location.
     */
    protected function authorizeLocation($user, Location $location): void
    {
        $hasAccess = $location->user_id === $user->id
            || ($location->organization_id && $location->organization_id === $user->organization_id);

        if (!$hasAccess) {
            abort(403, 'You do not have access to this location.');
        }
    }
}
