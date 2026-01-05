<?php

namespace Database\Factories;

use App\Models\Response;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Response>
 */
class ResponseFactory extends Factory
{
    protected $model = Response::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'review_id' => Review::factory(),
            'user_id' => User::factory(),
            'content' => fake()->paragraph(2),
            'tone' => fake()->randomElement(['professional', 'friendly', 'formal', 'casual']),
            'language' => fake()->randomElement(['fr', 'en', 'es', 'de']),
            'is_published' => false,
            'generation_time_ms' => fake()->numberBetween(500, 3000),
            'tokens_used' => fake()->numberBetween(100, 500),
        ];
    }

    /**
     * Configure the response as published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    /**
     * Configure the response with a specific tone.
     */
    public function withTone(string $tone): static
    {
        return $this->state(fn (array $attributes) => [
            'tone' => $tone,
        ]);
    }

    /**
     * Configure the response with a specific language.
     */
    public function withLanguage(string $language): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => $language,
        ]);
    }

    /**
     * Configure the response without a linked review (generated from extension).
     */
    public function standalone(): static
    {
        return $this->state(fn (array $attributes) => [
            'review_id' => null,
        ]);
    }
}
