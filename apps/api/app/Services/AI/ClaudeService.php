<?php

namespace App\Services\AI;

use Anthropic\Client;
use Anthropic\Messages\Message;
use Anthropic\Messages\TextBlock;
use Illuminate\Support\Facades\Log;

/**
 * Service for interacting with Claude API.
 */
class ClaudeService
{
    private ?Client $client = null;
    private string $model;

    public function __construct()
    {
        $this->model = config('services.anthropic.model', 'claude-3-haiku-20240307');
    }

    /**
     * Get or create the Anthropic client.
     *
     * @throws \RuntimeException If API key is not configured
     */
    private function getClient(): Client
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $apiKey = config('services.anthropic.api_key');

        if (empty($apiKey)) {
            throw new \RuntimeException('Anthropic API key is not configured.');
        }

        $this->client = new Client(apiKey: $apiKey);

        return $this->client;
    }

    /**
     * Generate a completion from Claude.
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
            $params = [
                'model' => $options['model'] ?? $this->model,
                'max_tokens' => $options['max_tokens'] ?? 500,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ];

            if (isset($options['system'])) {
                $params['system'] = $options['system'];
            }

            if (isset($options['temperature'])) {
                $params['temperature'] = $options['temperature'];
            }

            $response = $this->getClient()->messages->create($params);
            $endTime = microtime(true);

            $content = $this->extractTextContent($response);
            $tokensUsed = $response->usage->input_tokens + $response->usage->output_tokens;

            Log::info('Claude API request completed', [
                'model' => $params['model'],
                'tokens_used' => $tokensUsed,
                'generation_time_ms' => (int) (($endTime - $startTime) * 1000),
            ]);

            return [
                'content' => $content,
                'tokens_used' => $tokensUsed,
                'generation_time_ms' => (int) (($endTime - $startTime) * 1000),
            ];
        } catch (\Exception $e) {
            Log::error('Claude API error', [
                'error' => $e->getMessage(),
                'prompt_length' => strlen($prompt),
            ]);
            throw $e;
        }
    }

    /**
     * Extract text content from Claude response.
     */
    private function extractTextContent(Message $response): string
    {
        $textParts = [];

        foreach ($response->content as $block) {
            if ($block instanceof TextBlock) {
                $textParts[] = $block->text;
            }
        }

        return implode("\n", $textParts);
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
        return !empty(config('services.anthropic.api_key'));
    }
}
