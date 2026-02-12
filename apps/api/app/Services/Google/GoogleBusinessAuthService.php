<?php

namespace App\Services\Google;

use App\Models\ReviewConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GoogleBusinessAuthService
 *
 * Handles Google OAuth authentication for Google Business Profile API.
 */
class GoogleBusinessAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    /**
     * Required OAuth scopes for Google Business Profile.
     */
    private const SCOPES = [
        'https://www.googleapis.com/auth/business.manage',
    ];

    public function __construct()
    {
        $this->clientId = config('services.google.client_id') ?? '';
        $this->clientSecret = config('services.google.client_secret') ?? '';
        $this->redirectUri = config('services.google.redirect') ?? '';
    }

    /**
     * Generate OAuth authorization URL.
     *
     * @param int $locationId Location ID to associate with OAuth flow
     * @param string|null $customRedirect Custom redirect URI (optional)
     * @return string
     */
    public function getAuthUrl(int $locationId, ?string $customRedirect = null): string
    {
        $state = encrypt([
            'location_id' => $locationId,
            'timestamp' => time(),
        ]);

        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $customRedirect ?? $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', self::SCOPES),
            'access_type' => 'offline',
            'prompt' => 'consent', // Force consent to get refresh token
            'state' => base64_encode($state),
        ];

        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access and refresh tokens.
     *
     * @param string $code Authorization code from OAuth callback
     * @param string|null $customRedirect Custom redirect URI (must match the one used in auth URL)
     * @return array{access_token: string, refresh_token: string|null, expires_in: int}
     * @throws \Exception
     */
    public function handleCallback(string $code, ?string $customRedirect = null): array
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $customRedirect ?? $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth token exchange failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to exchange authorization code: ' . $response->body());
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? null,
            'expires_in' => $data['expires_in'] ?? 3600,
        ];
    }

    /**
     * Refresh an expired access token.
     *
     * @param string $refreshToken
     * @return array{access_token: string, expires_in: int}
     * @throws \Exception
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if (!$response->successful()) {
            Log::error('Google OAuth token refresh failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to refresh access token');
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'expires_in' => $data['expires_in'] ?? 3600,
        ];
    }

    /**
     * Get a valid access token for a review connection.
     * Refreshes the token if expired.
     *
     * @param ReviewConnection $connection
     * @return string
     * @throws \Exception
     */
    public function getValidAccessToken(ReviewConnection $connection): string
    {
        if (!$connection->access_token) {
            throw new \Exception('No access token available');
        }

        // Check if token is still valid (with 5 minute buffer)
        if ($connection->token_expires_at && $connection->token_expires_at->isFuture()) {
            $bufferTime = now()->addMinutes(5);
            if ($connection->token_expires_at->isAfter($bufferTime)) {
                return $connection->access_token;
            }
        }

        // Token is expired or about to expire, refresh it
        if (!$connection->refresh_token) {
            throw new \Exception('No refresh token available, re-authentication required');
        }

        $tokens = $this->refreshAccessToken($connection->refresh_token);

        // Update connection with new token
        $connection->update([
            'access_token' => $tokens['access_token'],
            'token_expires_at' => now()->addSeconds($tokens['expires_in']),
        ]);

        return $tokens['access_token'];
    }

    /**
     * Revoke OAuth access for a connection.
     *
     * @param ReviewConnection $connection
     */
    public function revokeAccess(ReviewConnection $connection): void
    {
        if ($connection->access_token) {
            try {
                Http::get('https://oauth2.googleapis.com/revoke', [
                    'token' => $connection->access_token,
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to revoke Google access token', [
                    'connection_id' => $connection->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Clear tokens from connection
        $connection->update([
            'access_token' => null,
            'refresh_token' => null,
            'token_expires_at' => null,
            'account_name' => null,
            'location_id_google' => null,
        ]);
    }

    /**
     * Decode state parameter from OAuth callback.
     *
     * @param string $state Base64 encoded state
     * @return array{location_id: int, timestamp: int}
     * @throws \Exception
     */
    public function decodeState(string $state): array
    {
        try {
            $decoded = decrypt(base64_decode($state));

            if (!isset($decoded['location_id'])) {
                throw new \Exception('Invalid state format');
            }

            // Check if state is not too old (10 minutes)
            if (isset($decoded['timestamp']) && time() - $decoded['timestamp'] > 600) {
                throw new \Exception('State has expired');
            }

            return $decoded;
        } catch (\Exception $e) {
            Log::error('Failed to decode OAuth state', [
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Invalid OAuth state');
        }
    }

    /**
     * Check if Google OAuth is configured.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret);
    }
}
