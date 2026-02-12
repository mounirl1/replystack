<?php

namespace Database\Factories;

use App\Models\ApifyRequest;
use App\Models\ReviewConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApifyRequest>
 */
class ApifyRequestFactory extends Factory
{
    protected $model = ApifyRequest::class;

    public function definition(): array
    {
        $platform = fake()->randomElement(['tripadvisor', 'booking', 'airbnb']);

        return [
            'review_connection_id' => ReviewConnection::factory(),
            'run_id' => fake()->uuid(),
            'actor_id' => ApifyRequest::ACTOR_IDS[$platform] ?? 'unknown/actor',
            'status' => ApifyRequest::STATUS_PENDING,
            'platform' => $platform,
            'reviews_requested' => 100,
        ];
    }

    public function running(): static
    {
        return $this->state(fn () => [
            'status' => ApifyRequest::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    public function completed(int $reviewsReceived = 50): static
    {
        return $this->state(fn () => [
            'status' => ApifyRequest::STATUS_COMPLETED,
            'started_at' => now()->subMinutes(5),
            'completed_at' => now(),
            'reviews_received' => $reviewsReceived,
        ]);
    }

    public function failed(string $error = 'Actor run failed'): static
    {
        return $this->state(fn () => [
            'status' => ApifyRequest::STATUS_FAILED,
            'started_at' => now()->subMinutes(5),
            'completed_at' => now(),
            'error_message' => $error,
        ]);
    }

    public function tripadvisor(): static
    {
        return $this->state(fn () => [
            'platform' => 'tripadvisor',
            'actor_id' => ApifyRequest::ACTOR_IDS['tripadvisor'],
        ]);
    }

    public function booking(): static
    {
        return $this->state(fn () => [
            'platform' => 'booking',
            'actor_id' => ApifyRequest::ACTOR_IDS['booking'],
        ]);
    }
}
