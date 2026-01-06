<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class MagicToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'redirect_url',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * The user this token belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the token is valid (not expired and not used).
     */
    public function isValid(): bool
    {
        return $this->used_at === null && $this->expires_at->isFuture();
    }

    /**
     * Mark the token as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }

    /**
     * Generate a new magic token for a user.
     */
    public static function generateFor(User $user, ?string $redirectUrl = null, int $expiresInMinutes = 5): self
    {
        // Clean up old expired tokens for this user
        static::where('user_id', $user->id)
            ->where('expires_at', '<', now())
            ->delete();

        return static::create([
            'user_id' => $user->id,
            'token' => Str::random(64),
            'redirect_url' => $redirectUrl,
            'expires_at' => now()->addMinutes($expiresInMinutes),
        ]);
    }

    /**
     * Find a valid token by its value.
     */
    public static function findValid(string $token): ?self
    {
        return static::where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
