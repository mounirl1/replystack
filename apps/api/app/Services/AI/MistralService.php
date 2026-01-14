<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AIProviderContract;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for interacting with Mistral AI API.
 */
class MistralService implements AIProviderContract
{
    private string $model;
    private string $baseUrl = 'https://api.mistral.ai/v1';

    public function __construct()
    {
        $this->model = config('services.mistral.model', 'mistral-small-latest');
    }

    /**
     * Generate a completion from Mistral.
     *
     * @param string $prompt The user prompt
     * @param array{model?: string, max_tokens?: int, temperature?: float, system?: string} $options
     * @return array{content: string, tokens_used: int, generation_time_ms: int}
     * @throws \Exception
     */
    public function generateCompletion(string $prompt, array $options = []): array
    {
        $startTime = microtime(true);

        try {
            $apiKey = config('services.mistral.api_key');

            if (empty($apiKey)) {
                throw new \RuntimeException('Mistral API key is not configured.');
            }

            $model = $options['model'] ?? $this->model;
            $maxTokens = $options['max_tokens'] ?? 500;
            $temperature = $options['temperature'] ?? 0.7;

            $messages = [];

            // Add system message if provided
            if (isset($options['system'])) {
                $messages[] = [
                    'role' => 'system',
                    'content' => $options['system'],
                ];
            }

            // Add user message
            $messages[] = [
                'role' => 'user',
                'content' => $prompt,
            ];

            $response = Http::timeout(60)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/chat/completions", [
                    'model' => $model,
                    'messages' => $messages,
                    'max_tokens' => $maxTokens,
                    'temperature' => $temperature,
                ]);

            $endTime = microtime(true);

            if (!$response->successful()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['message'] ?? $errorBody['error']['message'] ?? 'Unknown Mistral API error';
                throw new \RuntimeException("Mistral API error: {$errorMessage}");
            }

            $data = $response->json();
            $content = $this->extractTextContent($data);

            // Extract token usage
            $tokensUsed = $this->extractTokenUsage($data);

            Log::info('Mistral API request completed', [
                'model' => $model,
                'tokens_used' => $tokensUsed,
                'generation_time_ms' => (int) (($endTime - $startTime) * 1000),
            ]);

            return [
                'content' => $content,
                'tokens_used' => $tokensUsed,
                'generation_time_ms' => (int) (($endTime - $startTime) * 1000),
            ];
        } catch (\Exception $e) {
            Log::error('Mistral API error', [
                'error' => $e->getMessage(),
                'prompt_length' => strlen($prompt),
            ]);
            throw $e;
        }
    }

    /**
     * Extract text content from Mistral response.
     */
    private function extractTextContent(array $data): string
    {
        if (!isset($data['choices'][0]['message']['content'])) {
            return '';
        }

        return $data['choices'][0]['message']['content'];
    }

    /**
     * Extract token usage from Mistral response.
     */
    private function extractTokenUsage(array $data): int
    {
        $usage = $data['usage'] ?? [];

        $promptTokens = $usage['prompt_tokens'] ?? 0;
        $completionTokens = $usage['completion_tokens'] ?? 0;

        return $promptTokens + $completionTokens;
    }

    /**
     * Get the provider name.
     */
    public function getProviderName(): string
    {
        return 'mistral';
    }

    /**
     * Get the configured model name.
     */
    public function getModel(): string
    {
        return $this->model;
    }

    /**
     * Check if the service is properly configured.
     */
    public function isConfigured(): bool
    {
        return !empty(config('services.mistral.api_key'));
    }
}
