<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\ReviewConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReviewConnection>
 */
class ReviewConnectionFactory extends Factory
{
    protected $model = ReviewConnection::class;

    public function definition(): array
    {
        return [
            'location_id' => Location::factory(),
            'platform' => fake()->randomElement(['google', 'booking', 'tripadvisor', 'airbnb']),
            'is_active' => true,
            'platform_url' => fake()->url(),
            'platform_name' => fake()->company(),
            'label' => fake()->words(2, true),
            'apify_enabled' => false,
        ];
    }

    public function google(): static
    {
        return $this->state(fn () => [
            'platform' => 'google',
            'access_token' => encrypt('fake-access-token'),
            'refresh_token' => encrypt('fake-refresh-token'),
            'token_expires_at' => now()->addHour(),
        ]);
    }

    public function tripadvisor(): static
    {
        return $this->state(fn () => [
            'platform' => 'tripadvisor',
            'platform_url' => 'https://www.tripadvisor.com/Restaurant_Review-d12345',
        ]);
    }

    public function booking(): static
    {
        return $this->state(fn () => [
            'platform' => 'booking',
            'platform_url' => 'https://www.booking.com/hotel/fr/example.html',
        ]);
    }

    public function airbnb(): static
    {
        return $this->state(fn () => [
            'platform' => 'airbnb',
            'platform_url' => 'https://www.airbnb.com/rooms/12345',
        ]);
    }

    public function apifyEnabled(): static
    {
        return $this->state(fn () => [
            'apify_enabled' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }

    public function syncLocked(): static
    {
        return $this->state(fn () => [
            'sync_started_at' => now(),
        ]);
    }
}
