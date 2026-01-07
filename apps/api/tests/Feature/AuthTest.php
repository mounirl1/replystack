<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user can register with valid data.
     */
    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'name' => 'Test User',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'email',
                    'name',
                    'plan',
                    'quota' => [
                        'remaining',
                        'used',
                        'limit',
                        'resets_at',
                    ],
                    'created_at',
                ],
                'token',
            ])
            ->assertJson([
                'user' => [
                    'email' => 'test@example.com',
                    'name' => 'Test User',
                    'plan' => 'free',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'plan' => 'free',
        ]);
    }

    /**
     * Test that registration fails with invalid data.
     */
    public function test_register_fails_with_invalid_data(): void
    {
        // Missing email
        $response = $this->postJson('/api/auth/register', [
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Weak password
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Password mismatch
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'DifferentPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test that registration fails with duplicate email.
     */
    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test that a user can login with valid credentials.
     */
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'email',
                    'name',
                    'plan',
                    'quota',
                ],
                'token',
            ])
            ->assertJson([
                'user' => [
                    'email' => 'test@example.com',
                ],
            ]);
    }

    /**
     * Test that login fails with invalid credentials.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test that login fails with non-existent user.
     */
    public function test_login_fails_with_nonexistent_user(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test that a user can logout.
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logout successful.',
            ]);

        // Verify token is revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test that logout fails without authentication.
     */
    public function test_logout_fails_without_auth(): void
    {
        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(401);
    }

    /**
     * Test that an authenticated user can get their profile.
     */
    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'email',
                    'name',
                    'plan',
                    'quota' => [
                        'remaining',
                        'used',
                        'limit',
                        'resets_at',
                    ],
                    'created_at',
                ],
            ])
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'plan' => 'free',
                ],
            ]);
    }

    /**
     * Test that getting profile fails without authentication.
     */
    public function test_get_profile_fails_without_auth(): void
    {
        $response = $this->getJson('/api/auth/user');

        $response->assertStatus(401);
    }

    /**
     * Test that a user can logout from all devices.
     */
    public function test_user_can_logout_from_all_devices(): void
    {
        $user = User::factory()->create();

        // Create multiple tokens
        $user->createToken('token-1');
        $user->createToken('token-2');
        $currentToken = $user->createToken('token-3')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 3);

        $response = $this->withHeader('Authorization', 'Bearer ' . $currentToken)
            ->postJson('/api/auth/logout-all');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'All devices have been logged out.',
            ]);

        // All tokens should be revoked
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /**
     * Test that new user has correct default quota.
     */
    public function test_new_user_has_correct_quota(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'user' => [
                    'plan' => 'free',
                    'quota' => [
                        'remaining' => 10,
                        'used' => 0,
                        'limit' => 10,
                    ],
                ],
            ]);
    }
}
