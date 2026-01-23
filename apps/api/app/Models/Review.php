<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

/**
 * Review Model
 *
 * Represents a customer review from various platforms.
 *
 * @property int $id
 * @property int $location_id
 * @property int|null $review_connection_id
 * @property string $platform
 * @property string $external_id
 * @property string|null $platform_review_id
 * @property string|null $author_name
 * @property string|null $author_avatar
 * @property int|null $rating
 * @property string|null $content
 * @property string|null $language
 * @property \Carbon\Carbon|null $published_at
 * @property string $status
 * @property string|null $sync_source
 * @property \Carbon\Carbon|null $replied_at
 * @property bool $has_response
 * @property string|null $response_content
 * @property \Carbon\Carbon|null $response_published_at
 * @property float|null $sentiment_score
 * @property string|null $sentiment_label
 * @property array|null $sentiment_themes
 * @property \Carbon\Carbon|null $sentiment_analyzed_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read Location $location
 * @property-read ReviewConnection|null $reviewConnection
 * @property-read \Illuminate\Database\Eloquent\Collection|Response[] $responses
 * @property-read Response|null $latestResponse
 * @property-read string $time_ago
 * @property-read string $content_excerpt
 * @property-read bool $can_publish_via_api
 * @property-read string $sentiment_emoji
 */
class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'location_id',
        'review_connection_id',
        'platform',
        'external_id',
        'platform_review_id',
        'sync_source',
        'author_name',
        'author_avatar',
        'rating',
        'content',
        'language',
        'published_at',
        'status',
        'replied_at',
        'has_response',
        'response_content',
        'response_published_at',
        'sentiment_score',
        'sentiment_label',
        'sentiment_themes',
        'sentiment_analyzed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'replied_at' => 'datetime',
            'response_published_at' => 'datetime',
            'rating' => 'integer',
            'has_response' => 'boolean',
            'sentiment_score' => 'float',
            'sentiment_themes' => 'array',
            'sentiment_analyzed_at' => 'datetime',
        ];
    }

    /**
     * Get the location that the review belongs to.
     *
     * @return BelongsTo<Location, Review>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the review connection that this review belongs to.
     *
     * @return BelongsTo<ReviewConnection, Review>
     */
    public function reviewConnection(): BelongsTo
    {
        return $this->belongsTo(ReviewConnection::class);
    }

    /**
     * Get all responses for this review.
     *
     * @return HasMany<Response>
     */
    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }

    /**
     * Get the latest response for this review.
     *
     * @return HasOne<Response>
     */
    public function latestResponse(): HasOne
    {
        return $this->hasOne(Response::class)->latestOfMany();
    }

    /**
     * Check if the review is positive (4-5 stars).
     */
    public function isPositive(): bool
    {
        return $this->rating !== null && $this->rating >= 4;
    }

    /**
     * Check if the review is negative (1-2 stars).
     */
    public function isNegative(): bool
    {
        return $this->rating !== null && $this->rating <= 2;
    }

    /**
     * Check if the review is neutral (3 stars).
     */
    public function isNeutral(): bool
    {
        return $this->rating === 3;
    }

    /**
     * Check if the review has been replied to.
     */
    public function hasBeenReplied(): bool
    {
        return $this->status === 'replied';
    }

    /**
     * Mark the review as replied.
     */
    public function markAsReplied(): void
    {
        $this->update(['status' => 'replied']);
    }

    /**
     * Mark the review as ignored.
     */
    public function markAsIgnored(): void
    {
        $this->update(['status' => 'ignored']);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter pending reviews.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to filter replied reviews.
     */
    public function scopeReplied($query)
    {
        return $query->where('status', 'replied');
    }

    /**
     * Scope to filter ignored reviews.
     */
    public function scopeIgnored($query)
    {
        return $query->where('status', 'ignored');
    }

    /**
     * Scope to filter by platform.
     */
    public function scopeFromPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope to filter by exact rating.
     */
    public function scopeWithRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope to filter by rating range.
     */
    public function scopeByRating($query, int $min, int $max)
    {
        return $query->whereBetween('rating', [$min, $max]);
    }

    /**
     * Scope to filter negative reviews.
     */
    public function scopeNegative($query)
    {
        return $query->where('rating', '<=', 2);
    }

    /**
     * Scope to filter positive reviews.
     */
    public function scopePositive($query)
    {
        return $query->where('rating', '>=', 4);
    }

    /**
     * Scope to filter reviews from the last N days.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('published_at', '>=', now()->subDays($days));
    }

    /**
     * Scope to filter reviews that need a reply (pending + negative/neutral).
     */
    public function scopeNeedsReply($query)
    {
        return $query->where('status', 'pending')
            ->where('rating', '<=', 3);
    }

    /**
     * Scope to order by most recent first.
     */
    public function scopeLatest($query)
    {
        return $query->orderByDesc('published_at');
    }

    // ==================== SENTIMENT SCOPES ====================

    /**
     * Scope to filter reviews that have been sentiment analyzed.
     */
    public function scopeWithSentiment($query)
    {
        return $query->whereNotNull('sentiment_analyzed_at');
    }

    /**
     * Scope to filter reviews without sentiment analysis.
     */
    public function scopeWithoutSentiment($query)
    {
        return $query->whereNull('sentiment_analyzed_at');
    }

    /**
     * Scope to filter reviews with positive sentiment.
     */
    public function scopePositiveSentiment($query)
    {
        return $query->where('sentiment_label', 'positive');
    }

    /**
     * Scope to filter reviews with negative sentiment.
     */
    public function scopeNegativeSentiment($query)
    {
        return $query->where('sentiment_label', 'negative');
    }

    /**
     * Scope to filter reviews with neutral sentiment.
     */
    public function scopeNeutralSentiment($query)
    {
        return $query->where('sentiment_label', 'neutral');
    }

    /**
     * Scope to filter reviews containing a specific theme.
     */
    public function scopeWithTheme($query, string $theme)
    {
        return $query->whereJsonContains('sentiment_themes', $theme);
    }

    /**
     * Scope to filter reviews with sentiment score above threshold.
     */
    public function scopeSentimentAbove($query, float $threshold)
    {
        return $query->where('sentiment_score', '>=', $threshold);
    }

    /**
     * Scope to filter reviews with sentiment score below threshold.
     */
    public function scopeSentimentBelow($query, float $threshold)
    {
        return $query->where('sentiment_score', '<', $threshold);
    }

    // ==================== ACCESSORS ====================

    /**
     * Get human-readable time since publication.
     */
    public function getTimeAgoAttribute(): string
    {
        if ($this->published_at === null) {
            return 'Unknown';
        }

        return $this->published_at->diffForHumans();
    }

    /**
     * Get a truncated excerpt of the content (150 chars max).
     */
    public function getContentExcerptAttribute(): string
    {
        if (empty($this->content)) {
            return '';
        }

        return Str::limit($this->content, 150);
    }

    /**
     * Check if the review can be replied to via API (Google or Facebook).
     */
    public function getCanPublishViaApiAttribute(): bool
    {
        return in_array($this->platform, ['google', 'facebook'], true);
    }

    /**
     * Get the URL to view/reply to this review on its platform.
     */
    public function getPlatformUrlAttribute(): ?string
    {
        $location = $this->relationLoaded('location')
            ? $this->location
            : $this->load('location')->location;

        if (!$location) {
            return null;
        }

        return match ($this->platform) {
            'google' => $location->google_place_id
                ? "https://business.google.com/n/{$location->google_place_id}/reviews"
                : null,
            'facebook' => $location->facebook_page_id
                ? "https://www.facebook.com/{$location->facebook_page_id}/reviews"
                : null,
            'tripadvisor' => $location->tripadvisor_management_url,
            'booking' => $location->booking_management_url,
            'yelp' => $location->yelp_management_url,
            default => null,
        };
    }

    /**
     * Get emoji representation of sentiment.
     */
    public function getSentimentEmojiAttribute(): string
    {
        return match ($this->sentiment_label) {
            'positive' => "\u{1F60A}", // 😊
            'negative' => "\u{1F61E}", // 😞
            'neutral' => "\u{1F610}",  // 😐
            default => "\u{2753}",     // ❓
        };
    }

    /**
     * Check if the review has been sentiment analyzed.
     */
    public function hasSentimentAnalysis(): bool
    {
        return $this->sentiment_analyzed_at !== null;
    }

    /**
     * Check if the sentiment is positive.
     */
    public function hasSentimentPositive(): bool
    {
        return $this->sentiment_label === 'positive';
    }

    /**
     * Check if the sentiment is negative.
     */
    public function hasSentimentNegative(): bool
    {
        return $this->sentiment_label === 'negative';
    }

    /**
     * Check if the sentiment is neutral.
     */
    public function hasSentimentNeutral(): bool
    {
        return $this->sentiment_label === 'neutral';
    }

    /**
     * Check if the review has a specific theme.
     */
    public function hasTheme(string $theme): bool
    {
        return is_array($this->sentiment_themes) && in_array($theme, $this->sentiment_themes, true);
    }
}
