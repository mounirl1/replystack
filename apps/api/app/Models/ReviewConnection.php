<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * ReviewConnection Model
 *
 * Represents a connection between a location and a review platform.
 * Can be OAuth-based (Google) or URL-based (TripAdvisor, Booking, Airbnb).
 *
 * @property int $id
 * @property int $location_id
 * @property string $platform
 * @property bool $is_active
 * @property string|null $platform_url
 * @property string|null $platform_name
 * @property string|null $label
 * @property string|null $access_token
 * @property string|null $refresh_token
 * @property \Carbon\Carbon|null $token_expires_at
 * @property string|null $account_name
 * @property string|null $location_id_google
 * @property \Carbon\Carbon|null $last_synced_at
 * @property \Carbon\Carbon|null $sync_started_at
 * @property string|null $sync_error
 * @property string|null $sync_source
 * @property bool $apify_enabled
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 *
 * @property-read Location $location
 * @property-read \Illuminate\Database\Eloquent\Collection|Review[] $reviews
 * @property-read \Illuminate\Database\Eloquent\Collection|ApifyRequest[] $apifyRequests
 * @property-read bool $is_google
 * @property-read bool $has_valid_token
 * @property-read bool $is_sync_locked
 */
class ReviewConnection extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Sync lock duration in minutes.
     */
    public const SYNC_LOCK_DURATION_MINUTES = 15;

    /**
     * Available platforms.
     */
    public const PLATFORMS = ['google', 'booking', 'tripadvisor', 'airbnb'];

    /**
     * Platforms that support OAuth.
     */
    public const OAUTH_PLATFORMS = ['google'];

    /**
     * Platforms that support Apify scraping.
     */
    public const APIFY_PLATFORMS = ['tripadvisor', 'booking', 'airbnb'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'location_id',
        'platform',
        'is_active',
        'platform_url',
        'platform_name',
        'label',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'account_name',
        'location_id_google',
        'last_synced_at',
        'sync_started_at',
        'sync_error',
        'sync_source',
        'apify_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'apify_enabled' => 'boolean',
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
            'last_synced_at' => 'datetime',
            'sync_started_at' => 'datetime',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the location that owns this connection.
     *
     * @return BelongsTo<Location, ReviewConnection>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the reviews fetched through this connection.
     *
     * @return HasMany<Review>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the Apify requests for this connection.
     *
     * @return HasMany<ApifyRequest>
     */
    public function apifyRequests(): HasMany
    {
        return $this->hasMany(ApifyRequest::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to filter active connections.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by platform.
     */
    public function scopeForPlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope to filter Google connections.
     */
    public function scopeGoogle($query)
    {
        return $query->where('platform', 'google');
    }

    /**
     * Scope to filter connections with Apify enabled.
     */
    public function scopeApifyEnabled($query)
    {
        return $query->where('apify_enabled', true);
    }

    /**
     * Scope to filter connections that need sync (not locked, active).
     */
    public function scopeNeedsSync($query)
    {
        return $query->active()
            ->where(function ($q) {
                $q->whereNull('sync_started_at')
                    ->orWhere('sync_started_at', '<', now()->subMinutes(self::SYNC_LOCK_DURATION_MINUTES));
            });
    }

    /**
     * Scope to filter connections with valid OAuth tokens.
     */
    public function scopeWithValidToken($query)
    {
        return $query->whereNotNull('access_token')
            ->where(function ($q) {
                $q->whereNull('token_expires_at')
                    ->orWhere('token_expires_at', '>', now());
            });
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if this is a Google connection.
     */
    public function getIsGoogleAttribute(): bool
    {
        return $this->platform === 'google';
    }

    /**
     * Check if the OAuth token is valid.
     */
    public function getHasValidTokenAttribute(): bool
    {
        if (empty($this->access_token)) {
            return false;
        }

        if ($this->token_expires_at === null) {
            return true;
        }

        return $this->token_expires_at->isFuture();
    }

    /**
     * Check if sync is currently locked.
     */
    public function getIsSyncLockedAttribute(): bool
    {
        return $this->isSyncLocked();
    }

    // ==================== METHODS ====================

    /**
     * Check if the connection sync is currently locked.
     */
    public function isSyncLocked(): bool
    {
        if ($this->sync_started_at === null) {
            return false;
        }

        return $this->sync_started_at->isAfter(now()->subMinutes(self::SYNC_LOCK_DURATION_MINUTES));
    }

    /**
     * Mark sync as started (acquire lock).
     */
    public function markSyncStarted(?string $source = null): void
    {
        $this->update([
            'sync_started_at' => now(),
            'sync_error' => null,
            'sync_source' => $source,
        ]);
    }

    /**
     * Mark sync as successful (release lock).
     */
    public function markSyncSuccess(): void
    {
        $this->update([
            'sync_started_at' => null,
            'last_synced_at' => now(),
            'sync_error' => null,
        ]);
    }

    /**
     * Mark sync as failed (release lock with error).
     */
    public function markSyncFailed(string $error): void
    {
        $this->update([
            'sync_started_at' => null,
            'sync_error' => $error,
        ]);
    }

    /**
     * Check if the connection supports OAuth.
     */
    public function supportsOAuth(): bool
    {
        return in_array($this->platform, self::OAUTH_PLATFORMS, true);
    }

    /**
     * Check if the connection supports Apify scraping.
     */
    public function supportsApify(): bool
    {
        return in_array($this->platform, self::APIFY_PLATFORMS, true);
    }

    /**
     * Check if Apify is available for this connection (enabled + platform support).
     */
    public function canUseApify(): bool
    {
        return $this->apify_enabled && $this->supportsApify();
    }

    /**
     * Check if the connection has a platform URL configured.
     */
    public function hasUrl(): bool
    {
        return !empty($this->platform_url);
    }

    /**
     * Get the display name for this connection.
     */
    public function getDisplayName(): string
    {
        if (!empty($this->label)) {
            return $this->label;
        }

        if (!empty($this->platform_name)) {
            return $this->platform_name;
        }

        return ucfirst($this->platform);
    }
}
