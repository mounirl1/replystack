<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Location Model
 *
 * Represents a business location (restaurant, hotel, etc.) that receives reviews.
 *
 * @property int $id
 * @property int|null $organization_id
 * @property int $user_id
 * @property string $name
 * @property string|null $address
 * @property string|null $google_place_id
 * @property string|null $google_access_token
 * @property string|null $google_refresh_token
 * @property \Carbon\Carbon|null $google_token_expires_at
 * @property string|null $tripadvisor_id
 * @property string|null $tripadvisor_management_url
 * @property string|null $booking_id
 * @property string|null $booking_management_url
 * @property string|null $yelp_id
 * @property string|null $yelp_management_url
 * @property string|null $facebook_page_id
 * @property string|null $facebook_access_token
 * @property \Carbon\Carbon|null $facebook_token_expires_at
 * @property string $default_tone
 * @property string $default_language
 * @property \Carbon\Carbon|null $last_api_fetch_at
 * @property \Carbon\Carbon|null $last_extension_fetch_at
 * @property bool $auto_fetch_enabled
 * @property bool $alerts_enabled
 * @property string|null $alert_email
 * @property string|null $alert_slack_webhook
 * @property int $alert_negative_threshold
 * @property int $alert_negative_window_days
 * @property float $alert_sentiment_threshold
 * @property bool $alert_on_1_star
 * @property bool $alert_on_2_star
 * @property bool $alert_on_negative_trend
 * @property bool $alert_on_theme_spike
 * @property string $alert_recap_frequency
 * @property string|null $alert_recap_emails
 * @property \Carbon\Carbon|null $last_trend_alert_at
 * @property \Carbon\Carbon|null $last_review_alert_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property string|null $external_facility_id
 * @property string|null $external_source
 *
 * @property-read User $user
 * @property-read Organization|null $organization
 * @property-read \Illuminate\Database\Eloquent\Collection|Review[] $reviews
 * @property-read \Illuminate\Database\Eloquent\Collection|ReviewConnection[] $reviewConnections
 * @property-read LocationResponseProfile|null $responseProfile
 */
class Location extends Model
{
    use HasFactory;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'google_access_token',
        'google_refresh_token',
        'facebook_access_token',
        'alert_slack_webhook',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'has_google_connection',
        'has_facebook_connection',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'external_facility_id',
        'external_source',
        'user_id',
        'name',
        'address',
        'google_place_id',
        'google_access_token',
        'google_refresh_token',
        'google_token_expires_at',
        'tripadvisor_id',
        'tripadvisor_management_url',
        'booking_id',
        'booking_management_url',
        'yelp_id',
        'yelp_management_url',
        'facebook_page_id',
        'facebook_access_token',
        'facebook_token_expires_at',
        'default_tone',
        'default_language',
        'last_api_fetch_at',
        'last_extension_fetch_at',
        'auto_fetch_enabled',
        'alerts_enabled',
        'alert_email',
        'alert_slack_webhook',
        'alert_negative_threshold',
        'alert_negative_window_days',
        'alert_sentiment_threshold',
        'alert_on_1_star',
        'alert_on_2_star',
        'alert_on_negative_trend',
        'alert_on_theme_spike',
        'alert_recap_frequency',
        'alert_recap_emails',
        'last_trend_alert_at',
        'last_review_alert_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'google_access_token' => 'encrypted',
            'google_refresh_token' => 'encrypted',
            'facebook_access_token' => 'encrypted',
            'google_token_expires_at' => 'datetime',
            'facebook_token_expires_at' => 'datetime',
            'last_api_fetch_at' => 'datetime',
            'last_extension_fetch_at' => 'datetime',
            'auto_fetch_enabled' => 'boolean',
            'alerts_enabled' => 'boolean',
            'alert_slack_webhook' => 'encrypted',
            'alert_negative_threshold' => 'integer',
            'alert_negative_window_days' => 'integer',
            'alert_sentiment_threshold' => 'float',
            'alert_on_1_star' => 'boolean',
            'alert_on_2_star' => 'boolean',
            'alert_on_negative_trend' => 'boolean',
            'alert_on_theme_spike' => 'boolean',
            'last_trend_alert_at' => 'datetime',
            'last_review_alert_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the location.
     *
     * @return BelongsTo<User, Location>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the organization that the location belongs to.
     *
     * @return BelongsTo<Organization, Location>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the reviews for the location.
     *
     * @return HasMany<Review>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the response profile for the location.
     *
     * @return HasOne<LocationResponseProfile>
     */
    public function responseProfile(): HasOne
    {
        return $this->hasOne(LocationResponseProfile::class);
    }

    /**
     * Get the review connections for the location.
     *
     * @return HasMany<ReviewConnection>
     */
    public function reviewConnections(): HasMany
    {
        return $this->hasMany(ReviewConnection::class);
    }

    /**
     * Get the count of pending reviews.
     */
    public function getPendingReviewsCountAttribute(): int
    {
        return $this->reviews()->where('status', 'pending')->count();
    }

    /**
     * Get has_google_connection attribute for serialization.
     */
    public function getHasGoogleConnectionAttribute(): bool
    {
        return $this->hasGoogleConnection();
    }

    /**
     * Get has_facebook_connection attribute for serialization.
     */
    public function getHasFacebookConnectionAttribute(): bool
    {
        return $this->hasFacebookConnection();
    }

    /**
     * Check if Google API connection is configured (has place_id and access token).
     */
    public function hasGoogleConnection(): bool
    {
        return !empty($this->google_place_id) && !empty($this->google_access_token);
    }

    /**
     * Check if Facebook API connection is configured (has page_id and access token).
     */
    public function hasFacebookConnection(): bool
    {
        return !empty($this->facebook_page_id) && !empty($this->facebook_access_token);
    }

    /**
     * Check if Google OAuth token is still valid (not expired).
     */
    public function isGoogleTokenValid(): bool
    {
        if (!$this->hasGoogleConnection()) {
            return false;
        }

        if ($this->google_token_expires_at === null) {
            return true; // No expiration set, assume valid
        }

        return $this->google_token_expires_at->isFuture();
    }

    /**
     * Check if Facebook OAuth token is still valid (not expired).
     */
    public function isFacebookTokenValid(): bool
    {
        if (!$this->hasFacebookConnection()) {
            return false;
        }

        if ($this->facebook_token_expires_at === null) {
            return true; // No expiration set, assume valid
        }

        return $this->facebook_token_expires_at->isFuture();
    }

    /**
     * Get list of platforms with valid API connections.
     *
     * @return array<string>
     */
    public function getApiPlatforms(): array
    {
        $platforms = [];

        if ($this->isGoogleTokenValid()) {
            $platforms[] = 'google';
        }

        if ($this->isFacebookTokenValid()) {
            $platforms[] = 'facebook';
        }

        return $platforms;
    }

    /**
     * Get list of platforms that have management URLs configured (no API, extension-based).
     *
     * @return array<string>
     */
    public function getNonApiPlatforms(): array
    {
        $platforms = [];

        if (!empty($this->tripadvisor_management_url)) {
            $platforms[] = 'tripadvisor';
        }

        if (!empty($this->booking_management_url)) {
            $platforms[] = 'booking';
        }

        if (!empty($this->yelp_management_url)) {
            $platforms[] = 'yelp';
        }

        return $platforms;
    }

    /**
     * Check if a management URL is configured for the given platform.
     */
    public function hasManagementUrl(string $platform): bool
    {
        return match ($platform) {
            'tripadvisor' => !empty($this->tripadvisor_management_url),
            'booking' => !empty($this->booking_management_url),
            'yelp' => !empty($this->yelp_management_url),
            default => false,
        };
    }

    /**
     * Check if the location has a specific platform connected.
     */
    public function hasPlatformConnected(string $platform): bool
    {
        return match ($platform) {
            'google' => !empty($this->google_place_id),
            'tripadvisor' => !empty($this->tripadvisor_id),
            'booking' => !empty($this->booking_id),
            'yelp' => !empty($this->yelp_id),
            'facebook' => !empty($this->facebook_page_id),
            default => false,
        };
    }

    /**
     * Get the platform ID for a specific platform.
     */
    public function getPlatformId(string $platform): ?string
    {
        return match ($platform) {
            'google' => $this->google_place_id,
            'tripadvisor' => $this->tripadvisor_id,
            'booking' => $this->booking_id,
            'yelp' => $this->yelp_id,
            'facebook' => $this->facebook_page_id,
            default => null,
        };
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by organization.
     */
    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope to filter locations with auto-fetch enabled.
     */
    public function scopeAutoFetchEnabled($query)
    {
        return $query->where('auto_fetch_enabled', true);
    }

    /**
     * Scope to filter locations with valid Google API connection.
     */
    public function scopeWithGoogleApi($query)
    {
        return $query->whereNotNull('google_place_id')
            ->whereNotNull('google_access_token')
            ->where(function ($q) {
                $q->whereNull('google_token_expires_at')
                    ->orWhere('google_token_expires_at', '>', now());
            });
    }

    /**
     * Scope to filter locations with valid Facebook API connection.
     */
    public function scopeWithFacebookApi($query)
    {
        return $query->whereNotNull('facebook_page_id')
            ->whereNotNull('facebook_access_token')
            ->where(function ($q) {
                $q->whereNull('facebook_token_expires_at')
                    ->orWhere('facebook_token_expires_at', '>', now());
            });
    }

    /**
     * Scope to find location by external ID and source.
     */
    public function scopeByExternalId($query, string $externalId, string $source = 'triggerflow')
    {
        return $query->where('external_facility_id', $externalId)
            ->where('external_source', $source);
    }

    /**
     * Check if this location is linked to an external system.
     */
    public function isLinkedExternally(): bool
    {
        return !empty($this->external_facility_id) && !empty($this->external_source);
    }

    /**
     * Get the review connection for a specific platform.
     */
    public function getConnectionForPlatform(string $platform): ?ReviewConnection
    {
        return $this->reviewConnections()
            ->where('platform', $platform)
            ->first();
    }

    /**
     * Get all active review connections.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, ReviewConnection>
     */
    public function getActiveConnections()
    {
        return $this->reviewConnections()->active()->get();
    }

    // ==================== ALERT METHODS ====================

    /**
     * Check if alerts are enabled for this location.
     */
    public function hasAlertsEnabled(): bool
    {
        return $this->alerts_enabled && $this->hasAlertChannel();
    }

    /**
     * Check if at least one alert channel is configured.
     */
    public function hasAlertChannel(): bool
    {
        return !empty($this->alert_email) || !empty($this->alert_slack_webhook);
    }

    /**
     * Check if a trend alert can be sent (cooldown period expired).
     */
    public function canSendTrendAlert(int $cooldownMinutes = 60): bool
    {
        if (!$this->hasAlertsEnabled() || !$this->alert_on_negative_trend) {
            return false;
        }

        if ($this->last_trend_alert_at === null) {
            return true;
        }

        return $this->last_trend_alert_at->addMinutes($cooldownMinutes)->isPast();
    }

    /**
     * Check if a review alert can be sent (cooldown period expired).
     */
    public function canSendReviewAlert(int $cooldownMinutes = 15): bool
    {
        if (!$this->hasAlertsEnabled()) {
            return false;
        }

        if ($this->last_review_alert_at === null) {
            return true;
        }

        return $this->last_review_alert_at->addMinutes($cooldownMinutes)->isPast();
    }

    /**
     * Mark that a trend alert was sent.
     */
    public function markTrendAlertSent(): void
    {
        $this->update(['last_trend_alert_at' => now()]);
    }

    /**
     * Mark that a review alert was sent.
     */
    public function markReviewAlertSent(): void
    {
        $this->update(['last_review_alert_at' => now()]);
    }

    /**
     * Scope to filter locations with alerts enabled.
     */
    public function scopeWithAlertsEnabled($query)
    {
        return $query->where('alerts_enabled', true)
            ->where(function ($q) {
                $q->whereNotNull('alert_email')
                    ->orWhereNotNull('alert_slack_webhook');
            });
    }

    /**
     * Scope to filter locations that want negative trend alerts.
     */
    public function scopeWithNegativeTrendAlerts($query)
    {
        return $query->withAlertsEnabled()
            ->where('alert_on_negative_trend', true);
    }
}
