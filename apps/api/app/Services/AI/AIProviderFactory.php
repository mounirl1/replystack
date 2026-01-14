<?php

namespace App\Services\AI;

use App\Models\User;
use App\Services\AI\Contracts\AIProviderContract;

/**
 * Factory for creating AI provider instances.
 * Returns the appropriate provider based on user preferences and plan.
 */
class AIProviderFactory
{
    /**
     * Available AI providers.
     */
    public const PROVIDER_GEMINI = 'gemini';
    public const PROVIDER_MISTRAL = 'mistral';
    public const PROVIDER_CLAUDE = 'claude';

    /**
     * Default provider for all users.
     */
    public const DEFAULT_PROVIDER = self::PROVIDER_GEMINI;

    /**
     * Providers available to paid users only.
     */
    public const PAID_ONLY_PROVIDERS = [self::PROVIDER_MISTRAL];

    /**
     * All available providers.
     */
    public const ALL_PROVIDERS = [
        self::PROVIDER_GEMINI,
        self::PROVIDER_MISTRAL,
    ];

    /**
     * Create an AI provider instance.
     *
     * @param string|null $provider The provider name (gemini, mistral, claude)
     * @return AIProviderContract
     */
    public function make(?string $provider = null): AIProviderContract
    {
        $provider = $provider ?? self::DEFAULT_PROVIDER;

        return match ($provider) {
            self::PROVIDER_MISTRAL => app(MistralService::class),
            self::PROVIDER_CLAUDE => app(ClaudeService::class),
            default => app(GeminiService::class),
        };
    }

    /**
     * Create an AI provider instance for a specific user.
     * Respects user's provider preference if they have a paid plan.
     *
     * @param User $user
     * @return AIProviderContract
     */
    public function forUser(User $user): AIProviderContract
    {
        // Free users always get the default provider
        if (!$user->hasPaidPlan()) {
            return $this->make(self::DEFAULT_PROVIDER);
        }

        // Paid users get their preferred provider
        $provider = $user->ai_provider ?? self::DEFAULT_PROVIDER;

        // Validate the provider is available
        if (!in_array($provider, self::ALL_PROVIDERS)) {
            $provider = self::DEFAULT_PROVIDER;
        }

        return $this->make($provider);
    }

    /**
     * Get the list of available providers for a user.
     *
     * @param User|null $user
     * @return array<string, array{name: string, description: string, available: bool}>
     */
    public function getAvailableProvidersForUser(?User $user = null): array
    {
        $isPaidUser = $user && $user->hasPaidPlan();

        return [
            self::PROVIDER_GEMINI => [
                'name' => 'Gemini 2.0 Flash',
                'description' => 'Fast and efficient (Recommended)',
                'available' => true,
            ],
            self::PROVIDER_MISTRAL => [
                'name' => 'Mistral',
                'description' => 'European AI, excellent for French',
                'available' => $isPaidUser,
            ],
        ];
    }

    /**
     * Check if a provider is available for a user.
     *
     * @param string $provider
     * @param User|null $user
     * @return bool
     */
    public function isProviderAvailable(string $provider, ?User $user = null): bool
    {
        if (!in_array($provider, self::ALL_PROVIDERS)) {
            return false;
        }

        if (in_array($provider, self::PAID_ONLY_PROVIDERS)) {
            return $user && $user->hasPaidPlan();
        }

        return true;
    }
}
