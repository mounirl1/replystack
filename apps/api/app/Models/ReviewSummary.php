<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ReviewSummary Model
 *
 * Represents an AI-generated summary of filtered reviews.
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $location_id
 * @property string $filters_hash
 * @property array $filters
 * @property string $summary
 * @property array $strengths
 * @property array $improvements
 * @property array $keywords
 * @property int $review_count
 * @property int $tokens_used
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 * @property-read Location|null $location
 */
class ReviewSummary extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'location_id',
        'filters_hash',
        'filters',
        'summary',
        'strengths',
        'improvements',
        'keywords',
        'review_count',
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
            'filters' => 'array',
            'strengths' => 'array',
            'improvements' => 'array',
            'keywords' => 'array',
            'review_count' => 'integer',
            'tokens_used' => 'integer',
        ];
    }

    /**
     * Get the user who generated this summary.
     *
     * @return BelongsTo<User, ReviewSummary>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the location this summary is for.
     *
     * @return BelongsTo<Location, ReviewSummary>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Generate a hash for the given filters.
     * Used to identify unique filter combinations.
     */
    public static function generateFiltersHash(array $filters): string
    {
        // Normalize filters: remove null/empty values and sort keys
        $normalized = array_filter($filters, fn($v) => !is_null($v) && $v !== '' && $v !== []);
        ksort($normalized);

        return hash('sha256', json_encode($normalized));
    }

    /**
     * Find an existing summary for the given user and filters.
     */
    public static function findForFilters(int $userId, array $filters): ?self
    {
        $hash = self::generateFiltersHash($filters);

        return self::where('user_id', $userId)
            ->where('filters_hash', $hash)
            ->first();
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
