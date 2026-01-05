<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
            'quota_reset_at' => now(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Set the user to the starter plan.
     */
    public function starter(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'starter',
            'monthly_quota' => 50,
        ]);
    }

    /**
     * Set the user to the pro plan.
     */
    public function pro(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'pro',
            'monthly_quota' => 0,
        ]);
    }

    /**
     * Set the user to the business plan.
     */
    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'business',
            'monthly_quota' => 0,
        ]);
    }

    /**
     * Set the user to the enterprise plan.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'enterprise',
            'monthly_quota' => 0,
        ]);
    }

    /**
     * Set the user with exhausted quota (free plan).
     */
    public function exhaustedQuota(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 10,
        ]);
    }

    /**
     * Set the user with exhausted monthly quota (starter plan).
     */
    public function exhaustedMonthlyQuota(): static
    {
        return $this->state(fn (array $attributes) => [
            'plan' => 'starter',
            'monthly_quota' => 50,
            'quota_used_month' => 50,
        ]);
    }
}
