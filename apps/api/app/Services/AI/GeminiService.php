<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AIProviderContract;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for interacting with Google Gemini API.
 */
class GeminiService implements AIProviderContract
{
    private string $model;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $this->model = config('services.gemini.model', 'gemini-2.0-flash');
    }

    /**
     * Generate a completion from Gemini.
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
            $apiKey = config('services.gemini.api_key');

            if (empty($apiKey)) {
                throw new \RuntimeException('Gemini API key is not configured.');
            }

            $model = $options['model'] ?? $this->model;
            $maxTokens = $options['max_tokens'] ?? 500;
            $temperature = $options['temperature'] ?? 0.7;

            $contents = [];

            // Add system instruction if provided
            if (isset($options['system'])) {
                $contents[] = [
                    'role' => 'user',
                    'parts' => [['text' => $options['system']]],
                ];
                $contents[] = [
                    'role' => 'model',
                    'parts' => [['text' => 'Compris, je vais suivre ces instructions.']],
                ];
            }

            // Add the user prompt
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $prompt]],
            ];

            $response = Http::timeout(60)
                ->post("{$this->baseUrl}/models/{$model}:generateContent?key={$apiKey}", [
                    'contents' => $contents,
                    'generationConfig' => [
                        'maxOutputTokens' => $maxTokens,
                        'temperature' => $temperature,
                    ],
                ]);

            $endTime = microtime(true);

            if (!$response->successful()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? 'Unknown Gemini API error';
                throw new \RuntimeException("Gemini API error: {$errorMessage}");
            }

            $data = $response->json();
            $content = $this->extractTextContent($data);

            // Extract token usage from metadata
            $tokensUsed = $this->extractTokenUsage($data);

            Log::info('Gemini API request completed', [
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
            Log::error('Gemini API error', [
                'error' => $e->getMessage(),
                'prompt_length' => strlen($prompt),
            ]);
            throw $e;
        }
    }

    /**
     * Extract text content from Gemini response.
     */
    private function extractTextContent(array $data): string
    {
        if (!isset($data['candidates'][0]['content']['parts'])) {
            return '';
        }

        $textParts = [];
        foreach ($data['candidates'][0]['content']['parts'] as $part) {
            if (isset($part['text'])) {
                $textParts[] = $part['text'];
            }
        }

        return implode("\n", $textParts);
    }

    /**
     * Extract token usage from Gemini response.
     */
    private function extractTokenUsage(array $data): int
    {
        $usageMetadata = $data['usageMetadata'] ?? [];

        $promptTokens = $usageMetadata['promptTokenCount'] ?? 0;
        $candidatesTokens = $usageMetadata['candidatesTokenCount'] ?? 0;

        return $promptTokens + $candidatesTokens;
    }

    /**
     * Get the provider name.
     */
    public function getProviderName(): string
    {
        return 'gemini';
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
        return !empty(config('services.gemini.api_key'));
    }
}
