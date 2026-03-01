<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TriggerFlowAuthService
 *
 * Handles authentication validation for TriggerFlow users.
 * TriggerFlow acts as the auth provider, and we validate their tokens
 * by calling the TriggerFlow API.
 */
class TriggerFlowAuthService
{
    private string $apiUrl;
    private string $apiKey;

    /**
     * Cache duration for token validation (in seconds).
     */
    private const CACHE_DURATION = 300; // 5 minutes

    public function __construct()
    {
        $this->apiUrl = config('services.triggerflow.api_url') ?? '';
        $this->apiKey = config('services.triggerflow.api_key') ?? '';
    }

    /**
     * Validate a TriggerFlow bearer token.
     *
     * @param string $token The bearer token from TriggerFlow
     * @return array|null User data if valid, null if invalid
     */
    public function validateToken(string $token): ?array
    {
        // Check cache first to avoid hammering TriggerFlow API
        $cacheKey = 'triggerflow_token:' . hash('sha256', $token);

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($token) {
            return $this->callTriggerFlowApi($token);
        });
    }

    /**
     * Call TriggerFlow API to validate token and get user data.
     *
     * @param string $token
     * @return array|null
     */
    private function callTriggerFlowApi(string $token): ?array
    {
        if (empty($this->apiUrl)) {
            Log::warning('TriggerFlow API URL not configured');
            return null;
        }

        try {
            $response = Http::timeout(10)
                ->withToken($token)
                ->acceptJson()
                ->get("{$this->apiUrl}/api/auth/user");

            if ($response->successful()) {
                $userData = $response->json();

                // Validate required fields
                if (empty($userData['id']) || empty($userData['email'])) {
                    Log::warning('TriggerFlow API returned invalid user data', ['data' => $userData]);
                    return null;
                }

                return $userData;
            }

            // Token is invalid or expired
            if ($response->status() === 401) {
                return null;
            }

            Log::warning('TriggerFlow API returned unexpected status', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to validate TriggerFlow token', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Find or create a local ReplyStack user from TriggerFlow user data.
     *
     * @param array $triggerFlowUser User data from TriggerFlow
     * @return User
     */
    public function findOrCreateUser(array $triggerFlowUser): User
    {
        $externalUserId = (string) $triggerFlowUser['id'];

        // First try to find by external ID
        $user = User::byExternalId($externalUserId, 'triggerflow')->first();

        if ($user) {
            // Update user data if needed
            $this->syncUserData($user, $triggerFlowUser);
            return $user;
        }

        // Try to find by email (user might already exist as native ReplyStack user)
        $user = User::where('email', $triggerFlowUser['email'])->first();

        if ($user) {
            // Link existing user to TriggerFlow
            $user->update([
                'external_user_id' => $externalUserId,
                'external_source' => 'triggerflow',
            ]);
            $this->syncUserData($user, $triggerFlowUser);
            return $user;
        }

        // Create new user (use forceFill for guarded plan/monthly_quota fields)
        $user = new User();
        $user->forceFill([
            'email' => $triggerFlowUser['email'],
            'name' => $triggerFlowUser['name'] ?? null,
            'password' => bcrypt(str()->random(32)), // Random password, won't be used
            'plan' => $this->mapPlan($triggerFlowUser['plan'] ?? 'free'),
            'monthly_quota' => $this->mapQuota($triggerFlowUser['plan'] ?? 'free'),
            'external_user_id' => $externalUserId,
            'external_source' => 'triggerflow',
        ])->save();

        return $user;
    }

    /**
     * Sync user data from TriggerFlow to local user.
     *
     * @param User $user
     * @param array $triggerFlowUser
     */
    private function syncUserData(User $user, array $triggerFlowUser): void
    {
        $updates = [];

        // Sync name if changed
        if (isset($triggerFlowUser['name']) && $user->name !== $triggerFlowUser['name']) {
            $updates['name'] = $triggerFlowUser['name'];
        }

        // Sync plan if changed (use forceFill for guarded plan/monthly_quota fields)
        if (isset($triggerFlowUser['plan'])) {
            $newPlan = $this->mapPlan($triggerFlowUser['plan']);
            if ($user->plan !== $newPlan) {
                $updates['plan'] = $newPlan;
                $updates['monthly_quota'] = $this->mapQuota($triggerFlowUser['plan']);
            }
        }

        if (!empty($updates)) {
            $user->forceFill($updates)->save();
        }
    }

    /**
     * Map TriggerFlow plan to ReplyStack plan.
     *
     * @param string $triggerFlowPlan
     * @return string
     */
    private function mapPlan(string $triggerFlowPlan): string
    {
        return match (strtolower($triggerFlowPlan)) {
            'free', 'trial' => 'free',
            'starter', 'basic' => 'starter',
            'pro', 'professional' => 'pro',
            'business', 'agency' => 'business',
            'enterprise' => 'enterprise',
            default => 'free',
        };
    }

    /**
     * Map TriggerFlow plan to monthly quota.
     *
     * @param string $triggerFlowPlan
     * @return int
     */
    private function mapQuota(string $triggerFlowPlan): int
    {
        return match (strtolower($this->mapPlan($triggerFlowPlan))) {
            'free' => 15,
            'starter' => 50,
            'pro' => 200,
            'business' => 500,
            'enterprise' => 10000,
            default => 15,
        };
    }

    /**
     * Invalidate cached token validation.
     *
     * @param string $token
     */
    public function invalidateCache(string $token): void
    {
        $cacheKey = 'triggerflow_token:' . hash('sha256', $token);
        Cache::forget($cacheKey);
    }

    /**
     * Check if TriggerFlow integration is configured.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiUrl);
    }
}
