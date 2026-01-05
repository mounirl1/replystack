<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company(),
            'address' => fake()->address(),
            'google_place_id' => 'ChIJ' . fake()->regexify('[A-Za-z0-9]{20}'),
            'default_tone' => 'professional',
            'default_language' => 'auto',
        ];
    }

    /**
     * Configure the location to have a specific tone.
     */
    public function withTone(string $tone): static
    {
        return $this->state(fn (array $attributes) => [
            'default_tone' => $tone,
        ]);
    }

    /**
     * Configure the location to have a specific language.
     */
    public function withLanguage(string $language): static
    {
        return $this->state(fn (array $attributes) => [
            'default_language' => $language,
        ]);
    }

    /**
     * Configure the location for TripAdvisor.
     */
    public function forTripAdvisor(): static
    {
        return $this->state(fn (array $attributes) => [
            'tripadvisor_id' => fake()->regexify('[0-9]{7}'),
        ]);
    }

    /**
     * Configure the location for Booking.com.
     */
    public function forBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'booking_id' => fake()->regexify('[0-9]{8}'),
        ]);
    }
}
