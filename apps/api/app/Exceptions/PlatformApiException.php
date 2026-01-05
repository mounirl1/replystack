<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception for platform API errors (Google, Facebook, etc.)
 */
class PlatformApiException extends Exception
{
    public function __construct(
        public readonly string $platform,
        public readonly ?string $errorCode = null,
        public readonly ?string $errorMessage = null,
        ?Exception $previous = null
    ) {
        $message = "Platform API error [{$platform}]";

        if ($errorCode) {
            $message .= " - Code: {$errorCode}";
        }

        if ($errorMessage) {
            $message .= " - {$errorMessage}";
        }

        parent::__construct($message, 0, $previous);
    }

    /**
     * Check if this is an authentication error.
     */
    public function isAuthError(): bool
    {
        return in_array($this->errorCode, ['401', '403', 'UNAUTHENTICATED', 'PERMISSION_DENIED'], true);
    }

    /**
     * Check if this is a rate limit error.
     */
    public function isRateLimitError(): bool
    {
        return in_array($this->errorCode, ['429', 'RATE_LIMIT_EXCEEDED', 'RESOURCE_EXHAUSTED'], true);
    }

    /**
     * Create from HTTP response.
     */
    public static function fromResponse(string $platform, int $statusCode, ?string $body = null): self
    {
        $errorMessage = $body;
        $errorCode = (string) $statusCode;

        // Try to parse JSON error
        if ($body) {
            $decoded = json_decode($body, true);
            if (isset($decoded['error']['message'])) {
                $errorMessage = $decoded['error']['message'];
            }
            if (isset($decoded['error']['code'])) {
                $errorCode = (string) $decoded['error']['code'];
            }
        }

        return new self($platform, $errorCode, $errorMessage);
    }
}
