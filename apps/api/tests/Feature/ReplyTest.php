<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Response;
use App\Models\User;
use App\Services\AI\ClaudeService;
use App\Services\AI\ReplyGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class ReplyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that validation fails with missing required fields.
     */
    public function test_generate_requires_review_content(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['review_content']);
    }

    /**
     * Test that validation fails with invalid rating.
     */
    public function test_generate_requires_valid_rating(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 10, // Invalid
                'review_author' => 'John Doe',
                'platform' => 'google',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['review_rating']);
    }

    /**
     * Test that validation fails with invalid platform.
     */
    public function test_generate_requires_valid_platform(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'invalid_platform',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['platform']);
    }

    /**
     * Test that validation fails with invalid tone.
     */
    public function test_generate_requires_valid_tone(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
                'tone' => 'super_friendly', // Invalid
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tone']);
    }

    /**
     * Test successful reply generation with mocked Claude service.
     */
    public function test_can_generate_reply_successfully(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // Mock the ClaudeService
        $this->mock(ClaudeService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateCompletion')
                ->once()
                ->andReturn([
                    'content' => 'Merci beaucoup pour votre avis positif ! Nous sommes ravis que vous ayez apprécié notre service.',
                    'tokens_used' => 150,
                    'generation_time_ms' => 1200,
                ]);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Excellent restaurant, service impeccable !',
                'review_rating' => 5,
                'review_author' => 'Marie Dupont',
                'platform' => 'google',
                'tone' => 'professional',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reply',
                'tone',
                'language',
                'tokens_used',
                'generation_time_ms',
                'response_id',
                'quota_remaining',
            ]);

        // Check quota was decremented
        $user->refresh();
        $this->assertEquals(1, $user->quota_used_month);

        // Check response was saved
        $this->assertDatabaseHas('responses', [
            'user_id' => $user->id,
            'tone' => 'professional',
        ]);
    }

    /**
     * Test that quota is checked before generating.
     */
    public function test_blocks_generation_when_quota_exhausted(): void
    {
        $user = User::factory()->exhaustedQuota()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
            ]);

        $response->assertStatus(429)
            ->assertJson([
                'error' => 'QuotaExceeded',
            ]);
    }

    /**
     * Test that pro users are not blocked by quota.
     */
    public function test_pro_user_can_always_generate(): void
    {
        $user = User::factory()->pro()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        // Mock the ClaudeService
        $this->mock(ClaudeService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateCompletion')
                ->once()
                ->andReturn([
                    'content' => 'Thank you for your feedback!',
                    'tokens_used' => 100,
                    'generation_time_ms' => 800,
                ]);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
            ]);

        $response->assertStatus(200);
    }

    /**
     * Test that location defaults are used when provided.
     */
    public function test_uses_location_defaults(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'monthly_quota' => 10,
            'quota_used_month' => 0,
        ]);
        $location = Location::factory()->create([
            'user_id' => $user->id,
            'default_tone' => 'friendly',
            'default_language' => 'fr',
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        // Mock the ClaudeService
        $this->mock(ClaudeService::class, function (MockInterface $mock) {
            $mock->shouldReceive('generateCompletion')
                ->once()
                ->andReturn([
                    'content' => 'Merci beaucoup !',
                    'tokens_used' => 100,
                    'generation_time_ms' => 800,
                ]);
        });

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
                'location_id' => $location->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'tone' => 'friendly',
            ]);
    }

    /**
     * Test that user cannot access another user's location.
     */
    public function test_cannot_use_other_users_location(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $location = Location::factory()->create([
            'user_id' => $otherUser->id,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/replies/generate', [
                'review_content' => 'Great service!',
                'review_rating' => 5,
                'review_author' => 'John Doe',
                'platform' => 'google',
                'location_id' => $location->id,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Location not found or not accessible.',
            ]);
    }

    /**
     * Test getting response history.
     */
    public function test_can_get_response_history(): void
    {
        $user = User::factory()->create();
        Response::factory()->count(5)->standalone()->create([
            'user_id' => $user->id,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/replies');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'responses',
                'next_cursor',
                'has_more',
            ])
            ->assertJsonCount(5, 'responses');
    }

    /**
     * Test getting a specific response.
     */
    public function test_can_get_specific_response(): void
    {
        $user = User::factory()->create();
        $responseModel = Response::factory()->standalone()->create([
            'user_id' => $user->id,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/replies/' . $responseModel->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'response' => [
                    'id',
                    'content',
                    'tone',
                    'language',
                ],
            ]);
    }

    /**
     * Test that user cannot access another user's response.
     */
    public function test_cannot_access_other_users_response(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $responseModel = Response::factory()->standalone()->create([
            'user_id' => $otherUser->id,
        ]);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/replies/' . $responseModel->id);

        $response->assertStatus(404);
    }

    /**
     * Test language detection.
     */
    public function test_language_detection(): void
    {
        $service = new ReplyGeneratorService(
            Mockery::mock(ClaudeService::class)
        );

        // Use reflection to test private method
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('detectLanguage');
        $method->setAccessible(true);

        // French text
        $this->assertEquals('fr', $method->invoke($service, 'Bonjour, le service était très bien, merci beaucoup!'));

        // English text
        $this->assertEquals('en', $method->invoke($service, 'Hello, the service was very good, thank you very much!'));

        // Spanish text
        $this->assertEquals('es', $method->invoke($service, 'Hola, el servicio fue muy bueno, muchas gracias!'));

        // German text
        $this->assertEquals('de', $method->invoke($service, 'Hallo, der Service war sehr gut, danke sehr!'));
    }

    /**
     * Test tone validation in ReplyGeneratorService.
     */
    public function test_validates_tone(): void
    {
        $service = new ReplyGeneratorService(
            Mockery::mock(ClaudeService::class)
        );

        // Valid tone
        $this->assertEmpty($service->validateOptions(['tone' => 'professional']));
        $this->assertEmpty($service->validateOptions(['tone' => 'friendly']));

        // Invalid tone
        $errors = $service->validateOptions(['tone' => 'invalid']);
        $this->assertNotEmpty($errors);
    }

    /**
     * Test review data validation in ReplyGeneratorService.
     */
    public function test_validates_review_data(): void
    {
        $service = new ReplyGeneratorService(
            Mockery::mock(ClaudeService::class)
        );

        // Valid data
        $this->assertEmpty($service->validateReviewData([
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ]));

        // Missing content
        $errors = $service->validateReviewData([
            'rating' => 5,
            'author' => 'John',
            'platform' => 'google',
        ]);
        $this->assertNotEmpty($errors);

        // Invalid rating
        $errors = $service->validateReviewData([
            'content' => 'Great service!',
            'rating' => 10,
            'author' => 'John',
            'platform' => 'google',
        ]);
        $this->assertNotEmpty($errors);

        // Invalid platform
        $errors = $service->validateReviewData([
            'content' => 'Great service!',
            'rating' => 5,
            'author' => 'John',
            'platform' => 'invalid',
        ]);
        $this->assertNotEmpty($errors);
    }
}
