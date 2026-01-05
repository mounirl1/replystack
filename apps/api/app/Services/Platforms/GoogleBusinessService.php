<?php

namespace App\Services\Platforms;

use App\Contracts\PlatformApiInterface;
use App\Exceptions\PlatformApiException;
use App\Models\Location;
use App\Models\Review;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Google Business Profile API integration.
 *
 * @see https://developers.google.com/my-business/reference/rest
 */
class GoogleBusinessService implements PlatformApiInterface
{
    private const API_BASE_URL = 'https://mybusiness.googleapis.com/v4';
    private const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

    public function __construct(
        protected Location $location
    ) {}

    /**
     * Check if Google is connected (has access token).
     */
    public function isConnected(): bool
    {
        return !empty($this->location->google_access_token)
            && !empty($this->location->google_place_id);
    }

    /**
     * Check if the OAuth token is still valid.
     */
    public function isTokenValid(): bool
    {
        if (!$this->isConnected()) {
            return false;
        }

        if ($this->location->google_token_expires_at === null) {
            return true;
        }

        // Add 5 minute buffer
        return $this->location->google_token_expires_at->subMinutes(5)->isFuture();
    }

    /**
     * Refresh the access token using refresh token.
     *
     * @throws PlatformApiException
     */
    public function refreshToken(): void
    {
        if (empty($this->location->google_refresh_token)) {
            throw new PlatformApiException('google', 'NO_REFRESH_TOKEN', 'No refresh token available');
        }

        $response = Http::asForm()->post(self::OAUTH_TOKEN_URL, [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $this->location->google_refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            Log::error('Google token refresh failed', [
                'location_id' => $this->location->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw PlatformApiException::fromResponse('google', $response->status(), $response->body());
        }

        $data = $response->json();

        $this->location->update([
            'google_access_token' => $data['access_token'],
            'google_token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
        ]);

        // Refresh the model to get the new encrypted value
        $this->location->refresh();

        Log::info('Google token refreshed', ['location_id' => $this->location->id]);
    }

    /**
     * Get valid access token, refreshing if necessary.
     *
     * @throws PlatformApiException
     */
    public function getAccessToken(): string
    {
        if (!$this->isTokenValid()) {
            $this->refreshToken();
        }

        return $this->location->google_access_token;
    }

    /**
     * Fetch reviews from Google Business Profile API.
     *
     * @return array
     * @throws PlatformApiException
     */
    public function fetchReviews(): array
    {
        $reviews = [];
        $pageToken = null;
        $accountName = $this->getAccountName();

        do {
            $url = self::API_BASE_URL . "/{$accountName}/locations/{$this->location->google_place_id}/reviews";

            $queryParams = ['pageSize' => 50];
            if ($pageToken) {
                $queryParams['pageToken'] = $pageToken;
            }

            $response = $this->makeRequest('GET', $url, $queryParams);

            $data = $response->json();

            if (isset($data['reviews'])) {
                foreach ($data['reviews'] as $review) {
                    $reviews[] = $this->transformReview($review);
                }
            }

            $pageToken = $data['nextPageToken'] ?? null;

        } while ($pageToken);

        Log::info('Google reviews fetched', [
            'location_id' => $this->location->id,
            'count' => count($reviews),
        ]);

        return $reviews;
    }

    /**
     * Publish a reply to a review.
     *
     * @throws PlatformApiException
     */
    public function publishReply(Review $review, string $content): bool
    {
        if (!$review->platform_review_id) {
            throw new PlatformApiException('google', 'NO_REVIEW_ID', 'Review does not have a platform_review_id');
        }

        $url = self::API_BASE_URL . "/{$review->platform_review_id}/reply";

        $response = $this->makeRequest('PUT', $url, [], [
            'comment' => $content,
        ]);

        Log::info('Google reply published', [
            'review_id' => $review->id,
            'platform_review_id' => $review->platform_review_id,
        ]);

        return $response->successful();
    }

    /**
     * Delete a reply from a review.
     *
     * @throws PlatformApiException
     */
    public function deleteReply(Review $review): bool
    {
        if (!$review->platform_review_id) {
            throw new PlatformApiException('google', 'NO_REVIEW_ID', 'Review does not have a platform_review_id');
        }

        $url = self::API_BASE_URL . "/{$review->platform_review_id}/reply";

        $response = $this->makeRequest('DELETE', $url);

        Log::info('Google reply deleted', [
            'review_id' => $review->id,
            'platform_review_id' => $review->platform_review_id,
        ]);

        return $response->successful();
    }

    /**
     * Google supports publishing replies.
     */
    public function supportsPublish(): bool
    {
        return true;
    }

    /**
     * Make an authenticated API request.
     *
     * @throws PlatformApiException
     */
    protected function makeRequest(string $method, string $url, array $query = [], array $body = []): \Illuminate\Http\Client\Response
    {
        $token = $this->getAccessToken();

        $request = Http::withToken($token)
            ->acceptJson();

        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        $response = match (strtoupper($method)) {
            'GET' => $request->get($url),
            'POST' => $request->post($url, $body),
            'PUT' => $request->put($url, $body),
            'DELETE' => $request->delete($url),
            default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
        };

        if ($response->failed()) {
            // If 401, try to refresh token and retry once
            if ($response->status() === 401) {
                $this->refreshToken();
                $token = $this->location->google_access_token;

                $request = Http::withToken($token)->acceptJson();

                $response = match (strtoupper($method)) {
                    'GET' => $request->get($url),
                    'POST' => $request->post($url, $body),
                    'PUT' => $request->put($url, $body),
                    'DELETE' => $request->delete($url),
                };

                if ($response->failed()) {
                    throw PlatformApiException::fromResponse('google', $response->status(), $response->body());
                }
            } else {
                throw PlatformApiException::fromResponse('google', $response->status(), $response->body());
            }
        }

        return $response;
    }

    /**
     * Transform Google API review to our format.
     */
    protected function transformReview(array $review): array
    {
        // Rating is like "FIVE", "FOUR", etc.
        $ratingMap = [
            'ONE' => 1,
            'TWO' => 2,
            'THREE' => 3,
            'FOUR' => 4,
            'FIVE' => 5,
        ];

        $rating = $ratingMap[$review['starRating'] ?? 'FIVE'] ?? 5;

        // Check if there's already a reply
        $hasResponse = isset($review['reviewReply']);

        return [
            'external_id' => $this->extractReviewId($review['name'] ?? $review['reviewId'] ?? ''),
            'platform_review_id' => $review['name'] ?? null,
            'author_name' => $review['reviewer']['displayName'] ?? null,
            'author_avatar' => $review['reviewer']['profilePhotoUrl'] ?? null,
            'rating' => $rating,
            'content' => $review['comment'] ?? null,
            'published_at' => $review['createTime'] ?? now()->toIso8601String(),
            'has_response' => $hasResponse,
        ];
    }

    /**
     * Extract review ID from the full resource name.
     */
    protected function extractReviewId(string $name): string
    {
        // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
        $parts = explode('/', $name);
        return end($parts) ?: $name;
    }

    /**
     * Get the Google account name for API calls.
     * This should be stored or discovered via API.
     */
    protected function getAccountName(): string
    {
        // In a real implementation, you'd store this in the location
        // or fetch it via the accounts API
        // For now, we'll use a placeholder that would be set during OAuth
        return 'accounts/-'; // '-' means "infer from the authenticated user"
    }
}
