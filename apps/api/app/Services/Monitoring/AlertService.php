<?php

namespace App\Services\Monitoring;

use App\Models\Location;
use App\Models\Review;
use App\Services\Sentiment\NegativeTrendResult;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Service for sending alerts via various channels (Slack, email, etc.).
 */
class AlertService
{
    /**
     * Alert severity levels.
     */
    public const SEVERITY_INFO = 'info';
    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_ERROR = 'error';
    public const SEVERITY_CRITICAL = 'critical';

    /**
     * Slack colors for different severities.
     */
    private const SLACK_COLORS = [
        self::SEVERITY_INFO => '#36a64f',      // Green
        self::SEVERITY_WARNING => '#ffcc00',   // Yellow
        self::SEVERITY_ERROR => '#ff6600',     // Orange
        self::SEVERITY_CRITICAL => '#ff0000',  // Red
    ];

    /**
     * Slack emojis for different severities.
     */
    private const SLACK_EMOJIS = [
        self::SEVERITY_INFO => ':information_source:',
        self::SEVERITY_WARNING => ':warning:',
        self::SEVERITY_ERROR => ':x:',
        self::SEVERITY_CRITICAL => ':rotating_light:',
    ];

    /**
     * Send an alert to all configured channels.
     */
    public function send(
        string $title,
        string $message,
        string $severity = self::SEVERITY_INFO,
        array $context = []
    ): void {
        // Log the alert
        $this->logAlert($title, $message, $severity, $context);

        // Send to Slack if configured
        if ($this->isSlackConfigured()) {
            $this->sendToSlack($title, $message, $severity, $context);
        }
    }

    /**
     * Send a health check alert.
     */
    public function sendHealthAlert(HealthCheckResult $result): void
    {
        if ($result->isHealthy()) {
            return;
        }

        $severity = $result->isUnhealthy() ? self::SEVERITY_CRITICAL : self::SEVERITY_WARNING;
        $title = $result->isUnhealthy() ? 'System Unhealthy' : 'System Degraded';
        $failedChecks = $result->getFailedChecks();

        $message = $this->formatHealthCheckMessage($failedChecks);

        $this->send($title, $message, $severity, [
            'checks' => $failedChecks,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Send a failed job alert.
     */
    public function sendFailedJobAlert(string $jobName, string $error, array $context = []): void
    {
        $this->send(
            "Job Failed: {$jobName}",
            $error,
            self::SEVERITY_ERROR,
            array_merge(['job' => $jobName], $context)
        );
    }

    /**
     * Send a queue backup alert.
     */
    public function sendQueueBackupAlert(string $queue, int $size): void
    {
        $this->send(
            'Queue Backup Detected',
            "Queue '{$queue}' has {$size} pending jobs",
            self::SEVERITY_WARNING,
            ['queue' => $queue, 'size' => $size]
        );
    }

    /**
     * Send an exception alert.
     */
    public function sendExceptionAlert(\Throwable $exception, array $context = []): void
    {
        $this->send(
            'Exception: ' . get_class($exception),
            $exception->getMessage(),
            self::SEVERITY_ERROR,
            array_merge([
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $this->formatStackTrace($exception),
            ], $context)
        );
    }

    /**
     * Check if Slack is configured.
     */
    private function isSlackConfigured(): bool
    {
        return !empty(config('services.slack.alerts_webhook_url'));
    }

    /**
     * Send alert to Slack.
     */
    private function sendToSlack(
        string $title,
        string $message,
        string $severity,
        array $context
    ): void {
        $webhookUrl = config('services.slack.alerts_webhook_url');

        if (empty($webhookUrl)) {
            return;
        }

        try {
            $payload = $this->buildSlackPayload($title, $message, $severity, $context);

            Http::timeout(5)->post($webhookUrl, $payload);
        } catch (\Exception $e) {
            Log::error('Failed to send Slack alert', [
                'error' => $e->getMessage(),
                'title' => $title,
            ]);
        }
    }

    /**
     * Build Slack message payload.
     */
    private function buildSlackPayload(
        string $title,
        string $message,
        string $severity,
        array $context
    ): array {
        $color = self::SLACK_COLORS[$severity] ?? self::SLACK_COLORS[self::SEVERITY_INFO];
        $emoji = self::SLACK_EMOJIS[$severity] ?? self::SLACK_EMOJIS[self::SEVERITY_INFO];

        $fields = [];

        // Add context fields
        if (!empty($context)) {
            foreach ($context as $key => $value) {
                if (is_scalar($value)) {
                    $fields[] = [
                        'title' => ucfirst(str_replace('_', ' ', $key)),
                        'value' => (string) $value,
                        'short' => strlen((string) $value) < 40,
                    ];
                }
            }
        }

        // Add environment field
        $fields[] = [
            'title' => 'Environment',
            'value' => config('app.env'),
            'short' => true,
        ];

        return [
            'username' => 'ReplyStack Monitor',
            'icon_emoji' => ':robot_face:',
            'attachments' => [
                [
                    'color' => $color,
                    'pretext' => "{$emoji} *{$title}*",
                    'text' => $message,
                    'fields' => $fields,
                    'footer' => 'ReplyStack Monitoring',
                    'ts' => time(),
                ],
            ],
        ];
    }

    /**
     * Log the alert.
     */
    private function logAlert(
        string $title,
        string $message,
        string $severity,
        array $context
    ): void {
        $logLevel = match ($severity) {
            self::SEVERITY_CRITICAL, self::SEVERITY_ERROR => 'error',
            self::SEVERITY_WARNING => 'warning',
            default => 'info',
        };

        Log::$logLevel("[Alert] {$title}: {$message}", $context);
    }

    /**
     * Format health check message.
     */
    private function formatHealthCheckMessage(array $failedChecks): string
    {
        $lines = [];

        foreach ($failedChecks as $name => $check) {
            $status = $check['status'] ?? 'unknown';
            $error = $check['error'] ?? 'No details';

            $lines[] = "- {$name}: {$status}" . ($status !== 'healthy' ? " ({$error})" : '');
        }

        return implode("\n", $lines);
    }

    /**
     * Format stack trace for display.
     */
    private function formatStackTrace(\Throwable $exception): string
    {
        $trace = $exception->getTraceAsString();

        // Limit to first 5 lines
        $lines = explode("\n", $trace);
        $lines = array_slice($lines, 0, 5);

        return implode("\n", $lines);
    }

    // ==================== SENTIMENT ALERTS ====================

    /**
     * Send a negative trend alert for a location.
     */
    public function sendNegativeTrendAlert(Location $location, NegativeTrendResult $result): void
    {
        $severity = $result->getSeverity();
        $title = $result->isCritical()
            ? "Alerte critique : {$location->name}"
            : "Tendance négative : {$location->name}";

        $message = $this->formatTrendAlertMessage($location, $result);

        $context = [
            'location_id' => $location->id,
            'location_name' => $location->name,
            'trend' => $result->trend,
            'negative_count' => $result->negativeReviewsCount,
            'window_days' => $result->windowDays,
            'average_rating' => $result->currentStats['average_rating'],
        ];

        // Send to global monitoring channel
        $this->send($title, $message, $severity, $context);

        // Send to location-specific channels
        $this->sendToLocationChannels($location, $title, $message, $severity, $context);

        // Mark alert as sent
        $location->markTrendAlertSent();
    }

    /**
     * Send an immediate alert for a critical review.
     */
    public function sendCriticalReviewAlert(Review $review): void
    {
        $location = $review->location;

        $severity = $review->rating === 1 ? self::SEVERITY_CRITICAL : self::SEVERITY_WARNING;
        $title = "Avis {$review->rating} étoile(s) : {$location->name}";

        $message = $this->formatReviewAlertMessage($review);

        $context = [
            'location_id' => $location->id,
            'location_name' => $location->name,
            'review_id' => $review->id,
            'rating' => $review->rating,
            'platform' => $review->platform,
            'author' => $review->author_name,
        ];

        // Send to location-specific channels only (not global)
        $this->sendToLocationChannels($location, $title, $message, $severity, $context);

        // Mark alert as sent
        $location->markReviewAlertSent();
    }

    /**
     * Send alert to location-specific channels (email and/or Slack webhook).
     */
    private function sendToLocationChannels(
        Location $location,
        string $title,
        string $message,
        string $severity,
        array $context
    ): void {
        // Send to location-specific Slack webhook
        if (!empty($location->alert_slack_webhook)) {
            $this->sendToSlackWebhook(
                $location->alert_slack_webhook,
                $title,
                $message,
                $severity,
                $context
            );
        }

        // Send email if configured
        if (!empty($location->alert_email)) {
            $this->sendAlertEmail($location->alert_email, $title, $message, $severity, $context);
        }
    }

    /**
     * Send alert to a specific Slack webhook URL.
     */
    private function sendToSlackWebhook(
        string $webhookUrl,
        string $title,
        string $message,
        string $severity,
        array $context
    ): void {
        try {
            $payload = $this->buildSlackPayload($title, $message, $severity, $context);

            Http::timeout(5)->post($webhookUrl, $payload);
        } catch (\Exception $e) {
            Log::error('Failed to send location Slack alert', [
                'error' => $e->getMessage(),
                'title' => $title,
            ]);
        }
    }

    /**
     * Send alert email.
     */
    private function sendAlertEmail(
        string $email,
        string $title,
        string $message,
        string $severity,
        array $context
    ): void {
        try {
            // Use simple mail for now - could be upgraded to Mailable
            Mail::raw(
                $this->formatEmailBody($title, $message, $severity, $context),
                function ($mail) use ($email, $title, $severity) {
                    $mail->to($email)
                        ->subject("[ReplyStack] {$this->getSeverityPrefix($severity)} {$title}");
                }
            );
        } catch (\Exception $e) {
            Log::error('Failed to send alert email', [
                'error' => $e->getMessage(),
                'email' => $email,
                'title' => $title,
            ]);
        }
    }

    /**
     * Format the trend alert message.
     */
    private function formatTrendAlertMessage(Location $location, NegativeTrendResult $result): string
    {
        $lines = [
            $result->getTrendDescription(),
            '',
            "Période analysée : {$result->windowDays} derniers jours",
            "Avis négatifs : {$result->negativeReviewsCount}",
            "Avis critiques : {$result->criticalReviewsCount}",
        ];

        if ($result->currentStats['average_rating'] !== null) {
            $lines[] = "Note moyenne : {$result->currentStats['average_rating']}/5";
        }

        if ($result->currentStats['average_sentiment'] !== null) {
            $sentimentPercent = round($result->currentStats['average_sentiment'] * 100);
            $lines[] = "Score sentiment : {$sentimentPercent}%";
        }

        // Add rating change if available
        $ratingChange = $result->getRatingChange();
        if ($ratingChange !== null) {
            $sign = $ratingChange >= 0 ? '+' : '';
            $lines[] = "Évolution note : {$sign}{$ratingChange}";
        }

        // Add problem themes
        $problemThemes = $result->getTopProblemThemes(3);
        if (!empty($problemThemes)) {
            $lines[] = '';
            $lines[] = 'Thèmes problématiques :';
            foreach ($problemThemes as $theme => $data) {
                $indicator = $data['is_new'] ? '(nouveau)' : "(+{$data['increase']})";
                $lines[] = "- {$theme} : {$data['count']} mentions {$indicator}";
            }
        }

        return implode("\n", $lines);
    }

    /**
     * Format the review alert message.
     */
    private function formatReviewAlertMessage(Review $review): string
    {
        $lines = [
            "Nouvelle évaluation {$review->rating} étoile(s) reçue",
            '',
            "Plateforme : {$review->platform}",
            "Auteur : {$review->author_name}",
        ];

        if (!empty($review->content)) {
            $excerpt = strlen($review->content) > 300
                ? substr($review->content, 0, 300) . '...'
                : $review->content;
            $lines[] = '';
            $lines[] = "Contenu :";
            $lines[] = "\"{$excerpt}\"";
        }

        if ($review->sentiment_score !== null) {
            $sentimentPercent = round($review->sentiment_score * 100);
            $lines[] = '';
            $lines[] = "Score sentiment : {$sentimentPercent}% ({$review->sentiment_label})";
        }

        if (!empty($review->sentiment_themes)) {
            $themes = implode(', ', $review->sentiment_themes);
            $lines[] = "Thèmes détectés : {$themes}";
        }

        return implode("\n", $lines);
    }

    /**
     * Format email body with context.
     */
    private function formatEmailBody(
        string $title,
        string $message,
        string $severity,
        array $context
    ): string {
        $lines = [
            $title,
            str_repeat('=', strlen($title)),
            '',
            $message,
            '',
            '---',
            'Détails :',
        ];

        foreach ($context as $key => $value) {
            if (is_scalar($value)) {
                $label = ucfirst(str_replace('_', ' ', $key));
                $lines[] = "- {$label} : {$value}";
            }
        }

        $lines[] = '';
        $lines[] = '---';
        $lines[] = 'Cet email a été envoyé automatiquement par ReplyStack.';
        $lines[] = 'Connectez-vous au dashboard pour gérer vos alertes.';

        return implode("\n", $lines);
    }

    /**
     * Get severity prefix for email subject.
     */
    private function getSeverityPrefix(string $severity): string
    {
        return match ($severity) {
            self::SEVERITY_CRITICAL => '🚨 CRITIQUE',
            self::SEVERITY_ERROR => '❌ ERREUR',
            self::SEVERITY_WARNING => '⚠️ ATTENTION',
            default => 'ℹ️ INFO',
        };
    }
}
