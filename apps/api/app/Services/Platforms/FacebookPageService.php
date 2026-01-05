<?php

namespace App\Services\Platforms;

use App\Contracts\PlatformApiInterface;
use App\Exceptions\PlatformApiException;
use App\Models\Location;
use App\Models\Review;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Facebook Graph API integration for Page ratings/recommendations.
 *
 * @see https://developers.facebook.com/docs/graph-api/reference/page/ratings
 */
class FacebookPageService implements PlatformApiInterface
{
    private const API_BASE_URL = 'https://graph.facebook.com/v18.0';
    private const OAUTH_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';

    public function __construct(
        protected Location $location
    ) {}

    /**
     * Check if Facebook is connected (has access token and page ID).
     */
    public function isConnected(): bool
    {
        return !empty($this->location->facebook_access_token)
            && !empty($this->location->facebook_page_id);
    }

    /**
     * Check if the OAuth token is still valid.
     */
    public function isTokenValid(): bool
    {
        if (!$this->isConnected()) {
            return false;
        }

        if ($this->location->facebook_token_expires_at === null) {
            // Long-lived tokens don't expire for ~60 days
            return true;
        }

        // Add 1 day buffer for Facebook tokens
        return $this->location->facebook_token_expires_at->subDay()->isFuture();
    }

    /**
     * Refresh the access token.
     *
     * Note: Facebook long-lived tokens need to be exchanged before they expire.
     * If the token is expired, the user needs to re-authenticate.
     *
     * @throws PlatformApiException
     */
    public function refreshToken(): void
    {
        // Facebook doesn't have traditional refresh tokens
        // Long-lived tokens can be exchanged for new ones before expiry
        $response = Http::get(self::OAUTH_TOKEN_URL, [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'fb_exchange_token' => $this->location->facebook_access_token,
        ]);

        if ($response->failed()) {
            Log::error('Facebook token refresh failed', [
                'location_id' => $this->location->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw PlatformApiException::fromResponse('facebook', $response->status(), $response->body());
        }

        $data = $response->json();

        $this->location->update([
            'facebook_access_token' => $data['access_token'],
            'facebook_token_expires_at' => isset($data['expires_in'])
                ? now()->addSeconds($data['expires_in'])
                : now()->addDays(60), // Default for long-lived tokens
        ]);

        $this->location->refresh();

        Log::info('Facebook token refreshed', ['location_id' => $this->location->id]);
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

        return $this->location->facebook_access_token;
    }

    /**
     * Fetch reviews (ratings) from Facebook Page.
     *
     * @return array
     * @throws PlatformApiException
     */
    public function fetchReviews(): array
    {
        $reviews = [];
        $after = null;

        do {
            $url = self::API_BASE_URL . "/{$this->location->facebook_page_id}/ratings";

            $params = [
                'access_token' => $this->getAccessToken(),
                'fields' => 'reviewer{id,name,picture},rating,review_text,created_time,recommendation_type,open_graph_story{id}',
                'limit' => 50,
            ];

            if ($after) {
                $params['after'] = $after;
            }

            $response = Http::get($url, $params);

            if ($response->failed()) {
                throw PlatformApiException::fromResponse('facebook', $response->status(), $response->body());
            }

            $data = $response->json();

            if (isset($data['data'])) {
                foreach ($data['data'] as $rating) {
                    $reviews[] = $this->transformReview($rating);
                }
            }

            // Get next page cursor
            $after = $data['paging']['cursors']['after'] ?? null;
            $hasMore = isset($data['paging']['next']);

        } while ($hasMore && $after);

        Log::info('Facebook reviews fetched', [
            'location_id' => $this->location->id,
            'count' => count($reviews),
        ]);

        return $reviews;
    }

    /**
     * Publish a reply to a review/recommendation.
     *
     * Note: Facebook's ability to reply to recommendations is limited.
     * As of 2023, direct replies to recommendations may not be available via API.
     *
     * @throws PlatformApiException
     */
    public function publishReply(Review $review, string $content): bool
    {
        if (!$this->supportsPublish()) {
            throw new PlatformApiException(
                'facebook',
                'NOT_SUPPORTED',
                'Facebook does not currently support publishing replies via API'
            );
        }

        // If Facebook supports comments on recommendations/ratings
        if (!$review->platform_review_id) {
            throw new PlatformApiException('facebook', 'NO_REVIEW_ID', 'Review does not have a platform_review_id');
        }

        $url = self::API_BASE_URL . "/{$review->platform_review_id}/comments";

        $response = Http::post($url, [
            'access_token' => $this->getAccessToken(),
            'message' => $content,
        ]);

        if ($response->failed()) {
            throw PlatformApiException::fromResponse('facebook', $response->status(), $response->body());
        }

        Log::info('Facebook reply published', [
            'review_id' => $review->id,
            'platform_review_id' => $review->platform_review_id,
        ]);

        return $response->successful();
    }

    /**
     * Check if Facebook currently supports publishing replies.
     *
     * Note: Facebook's API for replying to recommendations has been
     * inconsistent. This method returns the current support status.
     */
    public function supportsPublish(): bool
    {
        // As of 2024, Facebook's recommendations API has limited reply support
        // This can be updated when/if Facebook enables this feature
        return false;
    }

    /**
     * Transform Facebook API rating to our format.
     */
    protected function transformReview(array $rating): array
    {
        // Facebook uses 1-5 rating or recommendation_type (positive/negative)
        $ratingValue = $rating['rating'] ?? null;

        if ($ratingValue === null && isset($rating['recommendation_type'])) {
            // Convert recommendation to rating
            $ratingValue = $rating['recommendation_type'] === 'positive' ? 5 : 2;
        }

        // Extract reviewer info
        $reviewer = $rating['reviewer'] ?? [];
        $authorAvatar = $reviewer['picture']['data']['url'] ?? null;

        // The open_graph_story ID can be used for comments
        $platformReviewId = $rating['open_graph_story']['id'] ?? null;

        return [
            'external_id' => $rating['id'] ?? ($reviewer['id'] ?? '') . '_' . ($rating['created_time'] ?? ''),
            'platform_review_id' => $platformReviewId,
            'author_name' => $reviewer['name'] ?? null,
            'author_avatar' => $authorAvatar,
            'rating' => $ratingValue ?? 5,
            'content' => $rating['review_text'] ?? null,
            'published_at' => $rating['created_time'] ?? now()->toIso8601String(),
            'has_response' => false, // Facebook API doesn't easily expose this
        ];
    }

    /**
     * Debug token to check validity and permissions.
     *
     * @throws PlatformApiException
     */
    public function debugToken(): array
    {
        $response = Http::get(self::API_BASE_URL . '/debug_token', [
            'input_token' => $this->location->facebook_access_token,
            'access_token' => config('services.facebook.client_id') . '|' . config('services.facebook.client_secret'),
        ]);

        if ($response->failed()) {
            throw PlatformApiException::fromResponse('facebook', $response->status(), $response->body());
        }

        return $response->json('data', []);
    }
}
