<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
            'platform' => $this->platform,
            'external_id' => $this->external_id,
            'platform_review_id' => $this->platform_review_id,

            // Author info
            'author_name' => $this->author_name,
            'author_avatar' => $this->author_avatar,

            // Review content
            'rating' => $this->rating,
            'content' => $this->content,
            'content_excerpt' => $this->content_excerpt, // Via accessor
            'language' => $this->language,

            // Timestamps
            'published_at' => $this->published_at?->toIso8601String(),
            'time_ago' => $this->time_ago, // Via accessor
            'replied_at' => $this->replied_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),

            // Status
            'status' => $this->status,

            // Location
            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),

            // Responses
            'responses_count' => $this->whenCounted('responses', $this->responses_count),
            'latest_response' => $this->whenLoaded('latestResponse', function () {
                if (!$this->latestResponse) {
                    return null;
                }

                return [
                    'id' => $this->latestResponse->id,
                    'content' => $this->latestResponse->content,
                    'is_published' => $this->latestResponse->is_published,
                    'created_at' => $this->latestResponse->created_at?->toIso8601String(),
                ];
            }),

            // Full responses list (when loaded individually)
            'responses' => $this->whenLoaded('responses', function () {
                return $this->responses->map(fn($response) => [
                    'id' => $response->id,
                    'content' => $response->content,
                    'tone' => $response->tone,
                    'language' => $response->language,
                    'is_published' => $response->is_published,
                    'published_at' => $response->published_at?->toIso8601String(),
                    'created_at' => $response->created_at?->toIso8601String(),
                    'user' => $response->relationLoaded('user') ? [
                        'id' => $response->user->id,
                        'name' => $response->user->name,
                    ] : null,
                ]);
            }),

            // Capabilities
            'can_publish_via_api' => $this->can_publish_via_api, // Via accessor
        ];
    }
}
