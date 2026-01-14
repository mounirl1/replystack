<?php

namespace App\Services\AI\Contracts;

/**
 * Contract for AI provider services.
 * All AI providers (Gemini, Mistral, Claude, etc.) must implement this interface.
 */
interface AIProviderContract
{
    /**
     * Generate a completion from the AI provider.
     *
     * @param string $prompt The user prompt
     * @param array{model?: string, max_tokens?: int, temperature?: float, system?: string} $options
     * @return array{content: string, tokens_used: int, generation_time_ms: int}
     * @throws \Exception
     */
    public function generateCompletion(string $prompt, array $options = []): array;

    /**
     * Get the provider name.
     */
    public function getProviderName(): string;

    /**
     * Get the configured model name.
     */
    public function getModel(): string;

    /**
     * Check if the service is properly configured.
     */
    public function isConfigured(): bool;
}
