<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $platforms = ['google', 'tripadvisor', 'booking', 'yelp', 'facebook'];

        return [
            'location_id' => Location::factory(),
            'platform' => fake()->randomElement($platforms),
            'external_id' => fake()->uuid(),
            'author_name' => fake()->name(),
            'rating' => fake()->numberBetween(1, 5),
            'content' => fake()->paragraph(3),
            'language' => fake()->randomElement(['fr', 'en', 'es', 'de']),
            'published_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'status' => 'pending',
        ];
    }

    /**
     * Configure the review as positive (4-5 stars).
     */
    public function positive(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(4, 5),
            'content' => 'Excellent experience! ' . fake()->paragraph(2),
        ]);
    }

    /**
     * Configure the review as negative (1-2 stars).
     */
    public function negative(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(1, 2),
            'content' => 'Very disappointing experience. ' . fake()->paragraph(2),
        ]);
    }

    /**
     * Configure the review as neutral (3 stars).
     */
    public function neutral(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 3,
            'content' => 'Average experience. ' . fake()->paragraph(2),
        ]);
    }

    /**
     * Configure the review as replied.
     */
    public function replied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'replied',
        ]);
    }

    /**
     * Configure the review as ignored.
     */
    public function ignored(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ignored',
        ]);
    }

    /**
     * Configure the review for a specific platform.
     */
    public function forPlatform(string $platform): static
    {
        return $this->state(fn (array $attributes) => [
            'platform' => $platform,
        ]);
    }

    /**
     * Configure the review with French content.
     */
    public function french(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'fr',
            'content' => 'Tres bonne experience ! Le service etait impeccable et le personnel tres accueillant.',
        ]);
    }

    /**
     * Configure the review with English content.
     */
    public function english(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'en',
            'content' => 'Great experience! The service was impeccable and the staff very welcoming.',
        ]);
    }
}
