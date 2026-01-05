<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Organization Model
 *
 * Represents an organization in the ReplyStack platform.
 * Organizations can have multiple users and locations (Business+ plans).
 *
 * @property int $id
 * @property string $name
 * @property int $owner_id
 * @property int $max_locations
 * @property int $max_users
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $owner
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $users
 * @property-read \Illuminate\Database\Eloquent\Collection|Location[] $locations
 * @property-read int $users_count
 * @property-read int $locations_count
 */
class Organization extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'owner_id',
        'max_locations',
        'max_users',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'max_locations' => 'integer',
        'max_users' => 'integer',
    ];

    /**
     * Get the owner of the organization.
     *
     * @return BelongsTo<User, Organization>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all users belonging to this organization.
     *
     * @return HasMany<User>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all locations belonging to this organization.
     *
     * @return HasMany<Location>
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Check if the organization can add more users.
     *
     * @return bool
     */
    public function canAddUser(): bool
    {
        return $this->users()->count() < $this->max_users;
    }

    /**
     * Check if the organization can add more locations.
     *
     * @return bool
     */
    public function canAddLocation(): bool
    {
        return $this->locations()->count() < $this->max_locations;
    }

    /**
     * Get the number of remaining user slots.
     *
     * @return int
     */
    public function getRemainingUserSlotsAttribute(): int
    {
        return max(0, $this->max_users - $this->users()->count());
    }

    /**
     * Get the number of remaining location slots.
     *
     * @return int
     */
    public function getRemainingLocationSlotsAttribute(): int
    {
        return max(0, $this->max_locations - $this->locations()->count());
    }

    /**
     * Add a user to the organization.
     *
     * @param User $user The user to add
     * @return bool True if user was added, false if organization is full
     */
    public function addUser(User $user): bool
    {
        if (!$this->canAddUser()) {
            return false;
        }

        $user->update(['organization_id' => $this->id]);
        return true;
    }

    /**
     * Remove a user from the organization.
     *
     * @param User $user The user to remove
     * @return bool
     */
    public function removeUser(User $user): bool
    {
        // Cannot remove the owner
        if ($user->id === $this->owner_id) {
            return false;
        }

        $user->update(['organization_id' => null]);
        return true;
    }

    /**
     * Transfer ownership to another user.
     *
     * @param User $newOwner The new owner (must be a member of the organization)
     * @return bool
     */
    public function transferOwnership(User $newOwner): bool
    {
        // New owner must be part of the organization
        if ($newOwner->organization_id !== $this->id) {
            return false;
        }

        $this->update(['owner_id' => $newOwner->id]);
        return true;
    }

    /**
     * Get organization statistics.
     *
     * @return array{users_count: int, locations_count: int, max_users: int, max_locations: int}
     */
    public function getStats(): array
    {
        return [
            'users_count' => $this->users()->count(),
            'locations_count' => $this->locations()->count(),
            'max_users' => $this->max_users,
            'max_locations' => $this->max_locations,
        ];
    }

    /**
     * Scope a query to only include organizations owned by a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOwnedBy($query, int $userId)
    {
        return $query->where('owner_id', $userId);
    }
}
