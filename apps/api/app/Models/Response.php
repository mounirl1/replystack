<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Response Model
 *
 * Represents an AI-generated reply to a review.
 *
 * @property int $id
 * @property int|null $review_id
 * @property int $user_id
 * @property string $content
 * @property string $tone
 * @property string $language
 * @property bool $is_published
 * @property \Carbon\Carbon|null $published_at
 * @property int|null $generation_time_ms
 * @property int|null $tokens_used
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read Review|null $review
 * @property-read User $user
 */
class Response extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'review_id',
        'user_id',
        'content',
        'tone',
        'language',
        'is_published',
        'published_at',
        'generation_time_ms',
        'tokens_used',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'generation_time_ms' => 'integer',
            'tokens_used' => 'integer',
        ];
    }

    /**
     * Get the review that this response belongs to.
     *
     * @return BelongsTo<Review, Response>
     */
    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Get the user who generated this response.
     *
     * @return BelongsTo<User, Response>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark the response as published.
     */
    public function markAsPublished(): void
    {
        $this->update([
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    /**
     * Get generation time in seconds.
     */
    public function getGenerationTimeSecondsAttribute(): ?float
    {
        return $this->generation_time_ms ? $this->generation_time_ms / 1000 : null;
    }

    /**
     * Scope to filter published responses.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to filter by tone.
     */
    public function scopeWithTone($query, string $tone)
    {
        return $query->where('tone', $tone);
    }

    /**
     * Scope to filter by user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to order by most recent first.
     */
    public function scopeLatest($query)
    {
        return $query->orderByDesc('created_at');
    }
}
