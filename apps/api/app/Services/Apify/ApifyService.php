<?php

namespace App\Services\Apify;

use App\Models\ApifyRequest;
use App\Models\ReviewConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ApifyService
 *
 * Handles Apify actor runs for scraping reviews from various platforms.
 */
class ApifyService
{
    private const API_BASE_URL = 'https://api.apify.com/v2';

    private string $apiToken;
    private string $webhookUrl;

    public function __construct()
    {
        $this->apiToken = config('services.apify.api_token') ?? '';
        $this->webhookUrl = config('services.apify.webhook_url') ?? '';
    }

    /**
     * Request TripAdvisor reviews scraping.
     */
    public function requestTripAdvisorReviews(ReviewConnection $connection, int $limit = 100): ApifyRequest
    {
        $this->validateConnection($connection, 'tripadvisor');

        $input = $this->buildBaseInput($connection->platform_url, $limit);
        $input['language'] = 'all';

        return $this->runActor(
            $connection,
            ApifyRequest::getActorIdForPlatform('tripadvisor'),
            'tripadvisor',
            $input,
            $limit
        );
    }

    /**
     * Request Booking.com reviews scraping.
     */
    public function requestBookingReviews(ReviewConnection $connection, int $limit = 100): ApifyRequest
    {
        $this->validateConnection($connection, 'booking');

        return $this->runActor(
            $connection,
            ApifyRequest::getActorIdForPlatform('booking'),
            'booking',
            $this->buildBaseInput($connection->platform_url, $limit),
            $limit
        );
    }

    /**
     * Request Airbnb reviews scraping.
     */
    public function requestAirbnbReviews(ReviewConnection $connection, int $limit = 100): ApifyRequest
    {
        $this->validateConnection($connection, 'airbnb');

        return $this->runActor(
            $connection,
            ApifyRequest::getActorIdForPlatform('airbnb'),
            'airbnb',
            $this->buildBaseInput($connection->platform_url, $limit),
            $limit
        );
    }

    /**
     * Build the base input array common to all Apify actor runs.
     */
    private function buildBaseInput(string $platformUrl, int $maxReviews): array
    {
        return [
            'startUrls' => [
                ['url' => $platformUrl],
            ],
            'maxReviews' => $maxReviews,
            'includeReviews' => true,
        ];
    }

    /**
     * Run an Apify actor and create a local tracking record.
     */
    private function runActor(
        ReviewConnection $connection,
        string $actorId,
        string $platform,
        array $input,
        int $reviewsRequested
    ): ApifyRequest {
        $this->ensureConfigured();

        // Build webhook URLs
        $webhooks = [];
        if (!empty($this->webhookUrl)) {
            $webhooks = [
                [
                    'eventTypes' => ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
                    'requestUrl' => $this->webhookUrl,
                ],
            ];
        }

        $response = Http::withToken($this->apiToken)
            ->post(self::API_BASE_URL . "/acts/{$actorId}/runs", [
                'input' => $input,
                'webhooks' => $webhooks,
            ]);

        if (!$response->successful()) {
            Log::error('Failed to start Apify actor', [
                'actor_id' => $actorId,
                'platform' => $platform,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to start Apify scraping job');
        }

        $data = $response->json('data');

        // Create local record to track the request
        return ApifyRequest::create([
            'run_id' => $data['id'],
            'actor_id' => $actorId,
            'review_connection_id' => $connection->id,
            'status' => ApifyRequest::STATUS_RUNNING,
            'platform' => $platform,
            'reviews_requested' => $reviewsRequested,
            'request_input' => $input,
            'started_at' => now(),
        ]);
    }

    /**
     * Get the status of an Apify run.
     */
    public function getRunStatus(string $runId): array
    {
        $this->ensureConfigured();

        $response = Http::withToken($this->apiToken)
            ->get(self::API_BASE_URL . "/actor-runs/{$runId}");

        if (!$response->successful()) {
            Log::error('Failed to get Apify run status', [
                'run_id' => $runId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to get Apify run status');
        }

        return $response->json('data');
    }

    /**
     * Get the results of a completed Apify run.
     */
    public function getRunResults(string $runId): array
    {
        $this->ensureConfigured();

        $response = Http::withToken($this->apiToken)
            ->get(self::API_BASE_URL . "/actor-runs/{$runId}/dataset/items");

        if (!$response->successful()) {
            Log::error('Failed to get Apify run results', [
                'run_id' => $runId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to get Apify run results');
        }

        return $response->json() ?? [];
    }

    /**
     * Abort a running Apify actor.
     */
    public function abortRun(string $runId): bool
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post(self::API_BASE_URL . "/actor-runs/{$runId}/abort");

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to abort Apify run', [
                'run_id' => $runId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Transform Apify review data to our format.
     */
    public function transformReview(array $apifyReview, string $platform): array
    {
        return match ($platform) {
            'tripadvisor' => $this->transformTripAdvisorReview($apifyReview),
            'booking' => $this->transformBookingReview($apifyReview),
            'airbnb' => $this->transformAirbnbReview($apifyReview),
            default => throw new \Exception("Unsupported platform: {$platform}"),
        };
    }

    /**
     * Transform TripAdvisor review data.
     */
    private function transformTripAdvisorReview(array $review): array
    {
        $rawRating = (float) ($review['rating'] ?? $review['bubbleRating'] ?? 0);
        $normalizedRating = \App\Models\Review::normalizeRating($rawRating, 'tripadvisor');

        $ownerReply = $review['ownerResponse']['text'] ?? null;

        return [
            'external_id' => $review['id'] ?? md5(json_encode($review)),
            'platform' => 'tripadvisor',
            'author_name' => $review['user']['username'] ?? $review['author'] ?? 'Anonymous',
            'author_avatar' => $review['user']['avatar'] ?? null,
            'rating' => (int) $rawRating,
            'normalized_rating' => $normalizedRating,
            'title' => $review['title'] ?? null,
            'content' => $review['text'] ?? $review['reviewText'] ?? '',
            'reviewer_country' => $review['user']['location'] ?? $review['userLocation'] ?? null,
            'traveler_type' => $review['tripType'] ?? $review['travelerType'] ?? null,
            'stay_date' => $review['stayDate'] ?? $review['travelDate'] ?? null,
            'published_at' => $this->parseDate($review['publishedDate'] ?? $review['date'] ?? null),
            'reply' => $ownerReply,
            'reply_date' => isset($review['ownerResponse']['publishedDate'])
                ? $this->parseDate($review['ownerResponse']['publishedDate'])
                : null,
            'has_response' => !empty($ownerReply),
            'response_content' => $ownerReply,
            'status' => !empty($ownerReply) ? 'replied' : 'pending',
        ];
    }

    /**
     * Transform Booking.com review data.
     */
    private function transformBookingReview(array $review): array
    {
        $positive = $review['positive'] ?? $review['pros'] ?? '';
        $negative = $review['negative'] ?? $review['cons'] ?? '';

        $content = trim($positive . "\n\n" . $negative);
        if (empty(trim($content)) && isset($review['text'])) {
            $content = $review['text'];
        }

        $rawRating = (float) ($review['score'] ?? $review['rating'] ?? 0);
        $normalizedRating = \App\Models\Review::normalizeRating($rawRating, 'booking');

        $ownerReply = $review['hotelResponse'] ?? null;

        return [
            'external_id' => $review['id'] ?? $review['reviewId'] ?? md5(json_encode($review)),
            'platform' => 'booking',
            'author_name' => $review['reviewer']['name'] ?? $review['author'] ?? 'Anonymous',
            'author_avatar' => $review['reviewer']['avatar'] ?? null,
            'rating' => (int) $rawRating,
            'normalized_rating' => $normalizedRating,
            'title' => $review['title'] ?? $review['headline'] ?? null,
            'content' => $content,
            'positive_comment' => !empty($positive) ? $positive : null,
            'negative_comment' => !empty($negative) ? $negative : null,
            'reviewer_country' => $review['reviewer']['country'] ?? $review['countryName'] ?? null,
            'stay_date' => $review['stayDate'] ?? $review['checkin'] ?? null,
            'room_type' => $review['roomType'] ?? $review['room'] ?? null,
            'traveler_type' => $review['travelerType'] ?? $review['groupName'] ?? null,
            'published_at' => $this->parseDate($review['date'] ?? $review['reviewDate'] ?? null),
            'reply' => $ownerReply,
            'reply_date' => isset($review['hotelResponseDate'])
                ? $this->parseDate($review['hotelResponseDate'])
                : null,
            'has_response' => !empty($ownerReply),
            'response_content' => $ownerReply,
            'status' => !empty($ownerReply) ? 'replied' : 'pending',
        ];
    }

    /**
     * Transform Airbnb review data.
     */
    private function transformAirbnbReview(array $review): array
    {
        $rawRating = (float) ($review['rating'] ?? 0);
        $normalizedRating = \App\Models\Review::normalizeRating($rawRating, 'airbnb');

        $ownerReply = $review['response']['comments'] ?? (is_string($review['response'] ?? null) ? $review['response'] : null);

        return [
            'external_id' => $review['id'] ?? md5(json_encode($review)),
            'platform' => 'airbnb',
            'author_name' => $review['reviewer']['firstName'] ?? $review['author'] ?? 'Anonymous',
            'author_avatar' => $review['reviewer']['pictureUrl'] ?? null,
            'rating' => (int) $rawRating,
            'normalized_rating' => $normalizedRating,
            'content' => $review['comments'] ?? $review['text'] ?? '',
            'reviewer_country' => $review['reviewer']['location'] ?? null,
            'published_at' => $this->parseDate($review['createdAt'] ?? $review['date'] ?? null),
            'reply' => $ownerReply,
            'has_response' => !empty($ownerReply),
            'response_content' => $ownerReply,
            'status' => !empty($ownerReply) ? 'replied' : 'pending',
        ];
    }

    /**
     * Parse a date string from various formats.
     */
    private function parseDate(?string $dateStr): ?\Carbon\Carbon
    {
        if (empty($dateStr)) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($dateStr);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Validate that the connection is properly configured.
     */
    private function validateConnection(ReviewConnection $connection, string $expectedPlatform): void
    {
        if ($connection->platform !== $expectedPlatform) {
            throw new \Exception("Connection is not for {$expectedPlatform}");
        }

        if (!$connection->canUseApify()) {
            throw new \Exception('Apify is not enabled for this connection');
        }

        if (empty($connection->platform_url)) {
            throw new \Exception('Platform URL is not configured');
        }
    }

    /**
     * Ensure Apify is properly configured.
     */
    private function ensureConfigured(): void
    {
        if (empty($this->apiToken)) {
            throw new \Exception('Apify API token is not configured');
        }
    }

    /**
     * Check if Apify is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiToken);
    }
}
