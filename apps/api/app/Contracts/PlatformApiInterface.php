<?php

namespace App\Contracts;

use App\Models\Review;

/**
 * Interface for platform API integrations (Google, Facebook, etc.)
 */
interface PlatformApiInterface
{
    /**
     * Check if the platform is connected (has credentials).
     */
    public function isConnected(): bool;

    /**
     * Check if the OAuth token is still valid.
     */
    public function isTokenValid(): bool;

    /**
     * Fetch reviews from the platform API.
     *
     * @return array<array{
     *     external_id: string,
     *     platform_review_id: string|null,
     *     author_name: string|null,
     *     author_avatar: string|null,
     *     rating: int,
     *     content: string|null,
     *     published_at: string,
     *     has_response: bool
     * }>
     */
    public function fetchReviews(): array;

    /**
     * Publish a reply to a review via the platform API.
     */
    public function publishReply(Review $review, string $content): bool;

    /**
     * Check if the platform supports publishing replies via API.
     */
    public function supportsPublish(): bool;
}
