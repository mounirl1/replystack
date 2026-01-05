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
 * @property \Carbon\Carbon|null $replied_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read Location $location
 * @property-read \Illuminate\Database\Eloquent\Collection|Response[] $responses
 * @property-read Response|null $latestResponse
 * @property-read string $time_ago
 * @property-read string $content_excerpt
 * @property-read bool $can_publish_via_api
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
        'platform',
        'external_id',
        'platform_review_id',
        'author_name',
        'author_avatar',
        'rating',
        'content',
        'language',
        'published_at',
        'status',
        'replied_at',
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
            'rating' => 'integer',
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
}
