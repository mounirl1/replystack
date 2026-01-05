<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service for synchronizing reviews from various sources.
 *
 * Handles batch upsert of reviews from API integrations (Google, Facebook)
 * and browser extension submissions.
 */
class ReviewSyncService
{
    /**
     * Valid platforms for review sync.
     */
    public const PLATFORMS = [
        'google',
        'tripadvisor',
        'booking',
        'yelp',
        'facebook',
        'g2',
        'capterra',
        'trustpilot',
    ];

    /**
     * Sync a batch of reviews for a location.
     *
     * @param Location $location The location to sync reviews for
     * @param string $platform The platform source (google, facebook, etc.)
     * @param array $reviews Array of review data with keys:
     *                       - external_id: string (required)
     *                       - author_name: string|null
     *                       - author_avatar: string|null
     *                       - rating: int (1-5)
     *                       - content: string|null
     *                       - language: string|null
     *                       - published_at: string|Carbon|null
     *                       - platform_review_id: string|null (native API ID)
     * @param string $source The sync source: 'api' or 'extension'
     * @return array{created: int, updated: int, unchanged: int, errors: int}
     */
    public function syncBatch(Location $location, string $platform, array $reviews, string $source = 'api'): array
    {
        if (!in_array($platform, self::PLATFORMS, true)) {
            throw new \InvalidArgumentException("Invalid platform: {$platform}");
        }

        $stats = [
            'created' => 0,
            'updated' => 0,
            'unchanged' => 0,
            'errors' => 0,
        ];

        if (empty($reviews)) {
            $this->updateFetchTimestamp($location, $source);
            return $stats;
        }

        // Get existing reviews for comparison
        $existingReviews = Review::where('location_id', $location->id)
            ->where('platform', $platform)
            ->whereIn('external_id', array_column($reviews, 'external_id'))
            ->get()
            ->keyBy('external_id');

        $toInsert = [];
        $toUpdate = [];
        $now = now();

        foreach ($reviews as $reviewData) {
            try {
                $externalId = $reviewData['external_id'] ?? null;

                if (empty($externalId)) {
                    $stats['errors']++;
                    Log::warning('ReviewSyncService: Missing external_id in review data', [
                        'location_id' => $location->id,
                        'platform' => $platform,
                    ]);
                    continue;
                }

                $normalized = $this->normalizeReviewData($reviewData, $location->id, $platform, $now);

                if ($existingReviews->has($externalId)) {
                    // Check if data has changed
                    $existing = $existingReviews->get($externalId);
                    if ($this->hasChanged($existing, $normalized)) {
                        $toUpdate[] = [
                            'id' => $existing->id,
                            'data' => $normalized,
                        ];
                        $stats['updated']++;
                    } else {
                        $stats['unchanged']++;
                    }
                } else {
                    $toInsert[] = $normalized;
                    $stats['created']++;
                }
            } catch (\Exception $e) {
                $stats['errors']++;
                Log::error('ReviewSyncService: Error processing review', [
                    'location_id' => $location->id,
                    'platform' => $platform,
                    'external_id' => $reviewData['external_id'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Perform batch operations
        DB::transaction(function () use ($toInsert, $toUpdate) {
            // Batch insert new reviews
            if (!empty($toInsert)) {
                Review::insert($toInsert);
            }

            // Update existing reviews
            foreach ($toUpdate as $update) {
                Review::where('id', $update['id'])->update($update['data']);
            }
        });

        // Update fetch timestamp
        $this->updateFetchTimestamp($location, $source);

        Log::info('ReviewSyncService: Batch sync completed', [
            'location_id' => $location->id,
            'platform' => $platform,
            'source' => $source,
            'stats' => $stats,
        ]);

        return $stats;
    }

    /**
     * Sync a single review (convenience method).
     *
     * @param Location $location
     * @param string $platform
     * @param array $reviewData
     * @param string $source
     * @return Review
     */
    public function syncOne(Location $location, string $platform, array $reviewData, string $source = 'api'): Review
    {
        if (!in_array($platform, self::PLATFORMS, true)) {
            throw new \InvalidArgumentException("Invalid platform: {$platform}");
        }

        $externalId = $reviewData['external_id'] ?? null;

        if (empty($externalId)) {
            throw new \InvalidArgumentException('Missing external_id in review data');
        }

        $normalized = $this->normalizeReviewData($reviewData, $location->id, $platform, now());

        $review = Review::updateOrCreate(
            [
                'location_id' => $location->id,
                'platform' => $platform,
                'external_id' => $externalId,
            ],
            $normalized
        );

        $this->updateFetchTimestamp($location, $source);

        return $review;
    }

    /**
     * Normalize review data for database insertion.
     *
     * @param array $data Raw review data
     * @param int $locationId
     * @param string $platform
     * @param \Carbon\Carbon $now
     * @return array
     */
    protected function normalizeReviewData(array $data, int $locationId, string $platform, $now): array
    {
        $publishedAt = null;
        if (!empty($data['published_at'])) {
            $publishedAt = $data['published_at'] instanceof \DateTimeInterface
                ? $data['published_at']
                : \Carbon\Carbon::parse($data['published_at']);
        }

        return [
            'location_id' => $locationId,
            'platform' => $platform,
            'external_id' => $data['external_id'],
            'platform_review_id' => $data['platform_review_id'] ?? null,
            'author_name' => $data['author_name'] ?? null,
            'author_avatar' => $data['author_avatar'] ?? null,
            'rating' => isset($data['rating']) ? (int) $data['rating'] : null,
            'content' => $data['content'] ?? null,
            'language' => $data['language'] ?? null,
            'published_at' => $publishedAt,
            'status' => $data['status'] ?? 'pending',
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /**
     * Check if review data has changed compared to existing record.
     *
     * @param Review $existing
     * @param array $new
     * @return bool
     */
    protected function hasChanged(Review $existing, array $new): bool
    {
        $fieldsToCompare = [
            'author_name',
            'author_avatar',
            'rating',
            'content',
            'language',
            'platform_review_id',
        ];

        foreach ($fieldsToCompare as $field) {
            $existingValue = $existing->{$field};
            $newValue = $new[$field] ?? null;

            // Handle rating comparison (int vs string)
            if ($field === 'rating') {
                $existingValue = $existingValue !== null ? (int) $existingValue : null;
                $newValue = $newValue !== null ? (int) $newValue : null;
            }

            if ($existingValue !== $newValue) {
                return true;
            }
        }

        return false;
    }

    /**
     * Update the appropriate fetch timestamp on the location.
     *
     * @param Location $location
     * @param string $source 'api' or 'extension'
     */
    protected function updateFetchTimestamp(Location $location, string $source): void
    {
        $column = $source === 'extension' ? 'last_extension_fetch_at' : 'last_api_fetch_at';
        $location->update([$column => now()]);
    }

    /**
     * Get sync statistics for a location.
     *
     * @param Location $location
     * @return array
     */
    public function getStats(Location $location): array
    {
        $reviews = $location->reviews();

        return [
            'total' => $reviews->count(),
            'pending' => $reviews->clone()->pending()->count(),
            'replied' => $reviews->clone()->replied()->count(),
            'ignored' => $reviews->clone()->ignored()->count(),
            'by_platform' => $reviews->clone()
                ->selectRaw('platform, COUNT(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform')
                ->toArray(),
            'by_rating' => $reviews->clone()
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating')
                ->toArray(),
            'last_api_fetch' => $location->last_api_fetch_at?->toIso8601String(),
            'last_extension_fetch' => $location->last_extension_fetch_at?->toIso8601String(),
        ];
    }
}
