<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ApifyRequest Model
 *
 * Tracks Apify actor runs for scraping reviews from various platforms.
 *
 * @property int $id
 * @property string $run_id
 * @property string $actor_id
 * @property int $review_connection_id
 * @property string $status
 * @property string $platform
 * @property int|null $reviews_requested
 * @property int|null $reviews_received
 * @property string|null $error_message
 * @property array|null $request_input
 * @property \Carbon\Carbon|null $started_at
 * @property \Carbon\Carbon|null $completed_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read ReviewConnection $reviewConnection
 * @property-read bool $is_finished
 * @property-read bool $is_successful
 */
class ApifyRequest extends Model
{
    use HasFactory;

    /**
     * Status constants.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_RUNNING = 'running';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    /**
     * Apify actor IDs for each platform.
     */
    public const ACTOR_IDS = [
        'tripadvisor' => 'maxcopell/tripadvisor-reviews',
        'booking' => 'voyager/booking-reviews-scraper',
        'airbnb' => 'dtrungtin/airbnb-scraper',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'run_id',
        'actor_id',
        'review_connection_id',
        'status',
        'platform',
        'reviews_requested',
        'reviews_received',
        'error_message',
        'request_input',
        'started_at',
        'completed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'request_input' => 'array',
            'reviews_requested' => 'integer',
            'reviews_received' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the review connection that this request belongs to.
     *
     * @return BelongsTo<ReviewConnection, ApifyRequest>
     */
    public function reviewConnection(): BelongsTo
    {
        return $this->belongsTo(ReviewConnection::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope to filter running requests.
     */
    public function scopeRunning($query)
    {
        return $query->where('status', self::STATUS_RUNNING);
    }

    /**
     * Scope to filter processing requests.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    /**
     * Scope to filter completed requests.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope to filter failed requests.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope to filter active (pending or running) requests.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_RUNNING, self::STATUS_PROCESSING]);
    }

    /**
     * Scope to filter by platform.
     */
    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if the request is finished (completed or failed).
     */
    public function getIsFinishedAttribute(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_FAILED], true);
    }

    /**
     * Check if the request was successful.
     */
    public function getIsSuccessfulAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    // ==================== METHODS ====================

    /**
     * Mark the request as running.
     */
    public function markRunning(): void
    {
        $this->update([
            'status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    /**
     * Mark the request as processing (fetching results).
     */
    public function markProcessing(): void
    {
        $this->update([
            'status' => self::STATUS_PROCESSING,
        ]);
    }

    /**
     * Mark the request as completed.
     */
    public function markCompleted(int $reviewsReceived): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'reviews_received' => $reviewsReceived,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the request as failed.
     */
    public function markFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
            'completed_at' => now(),
        ]);
    }

    /**
     * Get the actor ID for a platform.
     */
    public static function getActorIdForPlatform(string $platform): ?string
    {
        return self::ACTOR_IDS[$platform] ?? null;
    }

    /**
     * Calculate the duration of the request in seconds.
     */
    public function getDurationInSeconds(): ?int
    {
        if ($this->started_at === null || $this->completed_at === null) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->completed_at);
    }
}
