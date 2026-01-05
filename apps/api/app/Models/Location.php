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
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 * @property-read Organization|null $organization
 * @property-read \Illuminate\Database\Eloquent\Collection|Review[] $reviews
 * @property-read LocationResponseProfile|null $responseProfile
 */
class Location extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
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
     * Get the count of pending reviews.
     */
    public function getPendingReviewsCountAttribute(): int
    {
        return $this->reviews()->where('status', 'pending')->count();
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
}
