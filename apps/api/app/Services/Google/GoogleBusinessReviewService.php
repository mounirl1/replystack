<?php

namespace App\Services\Google;

use App\Models\Review;
use App\Models\ReviewConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GoogleBusinessReviewService
 *
 * Handles Google Business Profile review operations.
 */
class GoogleBusinessReviewService
{
    private const API_BASE_URL = 'https://mybusiness.googleapis.com/v4';

    public function __construct(
        private readonly GoogleBusinessAuthService $authService,
        private readonly GoogleBusinessAccountService $accountService
    ) {}

    /**
     * Get reviews for a location.
     *
     * @return array{reviews: array, nextPageToken: string|null, totalReviewCount: int}
     */
    public function getReviews(
        ReviewConnection $connection,
        int $pageSize = 50,
        ?string $pageToken = null
    ): array {
        $accessToken = $this->authService->getValidAccessToken($connection);
        $locationName = $this->accountService->getFullLocationName($connection);

        if (!$locationName) {
            throw new \Exception('No Google Business location configured');
        }

        $params = [
            'pageSize' => min($pageSize, 50),
        ];

        if ($pageToken) {
            $params['pageToken'] = $pageToken;
        }

        $response = Http::withToken($accessToken)
            ->get(self::API_BASE_URL . "/{$locationName}/reviews", $params);

        if (!$response->successful()) {
            Log::error('Failed to fetch Google Business reviews', [
                'location' => $locationName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to fetch reviews from Google Business Profile');
        }

        $data = $response->json();

        return [
            'reviews' => $data['reviews'] ?? [],
            'nextPageToken' => $data['nextPageToken'] ?? null,
            'totalReviewCount' => $data['totalReviewCount'] ?? 0,
        ];
    }

    /**
     * Reply to a review.
     */
    public function replyToReview(Review $review, string $comment): bool
    {
        $connection = $review->reviewConnection;

        if (!$connection || $connection->platform !== 'google') {
            throw new \Exception('Review is not associated with a Google connection');
        }

        $accessToken = $this->authService->getValidAccessToken($connection);
        $locationName = $this->accountService->getFullLocationName($connection);

        if (!$locationName) {
            throw new \Exception('No Google Business location configured');
        }

        // Build the review name
        $reviewName = "{$locationName}/reviews/{$review->external_id}";

        $response = Http::withToken($accessToken)
            ->put(self::API_BASE_URL . "/{$reviewName}/reply", [
                'comment' => $comment,
            ]);

        if (!$response->successful()) {
            Log::error('Failed to reply to Google Business review', [
                'review' => $reviewName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to post reply to Google Business Profile');
        }

        // Update review status
        $review->update([
            'status' => 'replied',
            'replied_at' => now(),
            'has_response' => true,
            'response_content' => $comment,
            'response_published_at' => now(),
        ]);

        return true;
    }

    /**
     * Delete a reply to a review.
     */
    public function deleteReply(Review $review): bool
    {
        $connection = $review->reviewConnection;

        if (!$connection || $connection->platform !== 'google') {
            throw new \Exception('Review is not associated with a Google connection');
        }

        $accessToken = $this->authService->getValidAccessToken($connection);
        $locationName = $this->accountService->getFullLocationName($connection);

        if (!$locationName) {
            throw new \Exception('No Google Business location configured');
        }

        $reviewName = "{$locationName}/reviews/{$review->external_id}";

        $response = Http::withToken($accessToken)
            ->delete(self::API_BASE_URL . "/{$reviewName}/reply");

        if (!$response->successful()) {
            Log::error('Failed to delete Google Business review reply', [
                'review' => $reviewName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Failed to delete reply from Google Business Profile');
        }

        // Update review status
        $review->update([
            'status' => 'pending',
            'has_response' => false,
            'response_content' => null,
            'response_published_at' => null,
        ]);

        return true;
    }

    /**
     * Transform Google API review data to our format.
     */
    public function transformReview(array $googleReview): array
    {
        // Extract review ID from name (format: accounts/.../locations/.../reviews/{id})
        $reviewId = basename($googleReview['name'] ?? '');

        // Map star rating
        $rating = $this->mapStarRating($googleReview['starRating'] ?? null);

        $hasReply = isset($googleReview['reviewReply']);
        $ownerReply = $googleReview['reviewReply']['comment'] ?? null;
        $replyDate = isset($googleReview['reviewReply']['updateTime'])
            ? \Carbon\Carbon::parse($googleReview['reviewReply']['updateTime'])
            : null;

        return [
            'external_id' => $reviewId,
            'platform' => 'google',
            'platform_review_id' => $googleReview['reviewId'] ?? $reviewId,
            'google_review_id' => $googleReview['name'] ?? null,
            'author_name' => $googleReview['reviewer']['displayName'] ?? 'Anonymous',
            'author_avatar' => $googleReview['reviewer']['profilePhotoUrl'] ?? null,
            'rating' => $rating,
            'normalized_rating' => $rating,
            'content' => $googleReview['comment'] ?? '',
            'published_at' => isset($googleReview['createTime'])
                ? \Carbon\Carbon::parse($googleReview['createTime'])
                : now(),
            'can_reply' => true,
            'reply' => $ownerReply,
            'reply_date' => $replyDate,
            'has_response' => $hasReply,
            'response_content' => $ownerReply,
            'response_published_at' => $replyDate,
            'status' => $hasReply ? 'replied' : 'pending',
        ];
    }

    /**
     * Map Google star rating string to numeric value.
     */
    private function mapStarRating(?string $starRating): int
    {
        return match ($starRating) {
            'ONE' => 1,
            'TWO' => 2,
            'THREE' => 3,
            'FOUR' => 4,
            'FIVE' => 5,
            default => 0,
        };
    }
}
