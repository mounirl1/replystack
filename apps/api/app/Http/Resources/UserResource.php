<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource for transforming User model to JSON response.
 *
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'name' => $this->name,
            'plan' => $this->plan,
            'quota' => [
                'remaining' => $this->quota_remaining,
                'used' => $this->quota_used,
                'limit' => $this->quota_limit,
                'resets_at' => $this->getQuotaResetDate(),
            ],
            'organization' => $this->when(
                $this->relationLoaded('organization') && $this->organization,
                fn () => [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'is_owner' => $this->isOrganizationOwner(),
                ]
            ),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    /**
     * Get the quota reset date.
     *
     * @return string|null
     */
    protected function getQuotaResetDate(): ?string
    {
        if (in_array($this->plan, ['pro', 'business', 'enterprise'])) {
            return null;
        }

        if ($this->plan === 'free') {
            return now()->addDay()->startOfDay()->toIso8601String();
        }

        return now()->addMonth()->startOfMonth()->toIso8601String();
    }
}
