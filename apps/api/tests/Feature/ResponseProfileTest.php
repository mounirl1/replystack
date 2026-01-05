<?php

namespace Tests\Feature;

use App\Enums\BusinessSector;
use App\Enums\NegativeStrategy;
use App\Enums\ResponseLength;
use App\Enums\ResponseTone;
use App\Models\Location;
use App\Models\LocationResponseProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResponseProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->location = Location::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Restaurant',
        ]);
    }

    public function test_can_get_default_profile_when_none_exists(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/locations/{$this->location->id}/response-profile");

        $response->assertOk()
            ->assertJson([
                'exists' => false,
                'profile' => [
                    'business_name' => 'Test Restaurant',
                    'tone' => ResponseTone::PROFESSIONAL->value,
                    'default_length' => ResponseLength::MEDIUM->value,
                    'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
                    'include_customer_name' => true,
                    'include_business_name' => true,
                    'include_emojis' => false,
                    'include_invitation' => true,
                    'include_signature' => true,
                    'onboarding_completed' => false,
                ],
            ]);
    }

    public function test_can_create_response_profile(): void
    {
        $profileData = [
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
            'signature' => 'L\'équipe du Petit Bistrot',
            'tone' => ResponseTone::WARM->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            'include_customer_name' => true,
            'include_business_name' => true,
            'include_emojis' => false,
            'include_invitation' => true,
            'include_signature' => true,
            'onboarding_completed' => true,
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/locations/{$this->location->id}/response-profile", $profileData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Response profile saved successfully.',
                'profile' => [
                    'business_sector' => BusinessSector::RESTAURANT->value,
                    'business_name' => 'Le Petit Bistrot',
                    'tone' => ResponseTone::WARM->value,
                    'onboarding_completed' => true,
                ],
            ]);

        $this->assertDatabaseHas('location_response_profiles', [
            'location_id' => $this->location->id,
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
        ]);
    }

    public function test_can_update_existing_profile(): void
    {
        // First create a profile
        LocationResponseProfile::create([
            'location_id' => $this->location->id,
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
            'tone' => ResponseTone::PROFESSIONAL->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            'onboarding_completed' => true,
        ]);

        // Update the profile
        $response = $this->actingAs($this->user)
            ->postJson("/api/locations/{$this->location->id}/response-profile", [
                'business_sector' => BusinessSector::RESTAURANT->value,
                'business_name' => 'Le Grand Bistrot',
                'tone' => ResponseTone::WARM->value,
                'default_length' => ResponseLength::DETAILED->value,
                'negative_strategy' => NegativeStrategy::SOLUTION->value,
                'onboarding_completed' => true,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('location_response_profiles', [
            'location_id' => $this->location->id,
            'business_name' => 'Le Grand Bistrot',
            'tone' => ResponseTone::WARM->value,
            'default_length' => ResponseLength::DETAILED->value,
        ]);

        // Should only have one profile
        $this->assertEquals(1, LocationResponseProfile::where('location_id', $this->location->id)->count());
    }

    public function test_can_reset_profile(): void
    {
        // Create a profile
        LocationResponseProfile::create([
            'location_id' => $this->location->id,
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
            'tone' => ResponseTone::WARM->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            'onboarding_completed' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/locations/{$this->location->id}/response-profile/reset");

        $response->assertOk()
            ->assertJson([
                'message' => 'Response profile reset to defaults.',
                'profile' => [
                    'business_name' => 'Test Restaurant',
                    'onboarding_completed' => false,
                ],
            ]);

        $this->assertDatabaseMissing('location_response_profiles', [
            'location_id' => $this->location->id,
        ]);
    }

    public function test_cannot_access_other_users_location_profile(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->getJson("/api/locations/{$this->location->id}/response-profile");

        $response->assertNotFound();
    }

    public function test_can_get_profile_options(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/response-profile/options');

        $response->assertOk()
            ->assertJsonStructure([
                'sectors' => [
                    '*' => ['value', 'label', 'icon'],
                ],
                'tones' => [
                    '*' => ['value', 'label', 'description', 'example'],
                ],
                'lengths' => [
                    '*' => ['value', 'label', 'description', 'wordRange'],
                ],
                'negativeStrategies' => [
                    '*' => ['value', 'label', 'description'],
                ],
            ]);

        $data = $response->json();
        $this->assertCount(18, $data['sectors']); // 18 business sectors
        $this->assertCount(5, $data['tones']); // 5 tones
        $this->assertCount(3, $data['lengths']); // 3 lengths
        $this->assertCount(5, $data['negativeStrategies']); // 5 strategies
    }

    public function test_can_get_sectors_list(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/response-profile/sectors');

        $response->assertOk()
            ->assertJsonStructure([
                'sectors' => [
                    '*' => ['value', 'label', 'icon'],
                ],
            ]);

        $data = $response->json();
        $this->assertCount(18, $data['sectors']);
    }

    public function test_validation_requires_business_name(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/locations/{$this->location->id}/response-profile", [
                'business_sector' => BusinessSector::RESTAURANT->value,
                'tone' => ResponseTone::WARM->value,
                'default_length' => ResponseLength::MEDIUM->value,
                'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
                // Missing business_name
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['business_name']);
    }

    public function test_validation_requires_valid_tone(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/locations/{$this->location->id}/response-profile", [
                'business_name' => 'Test',
                'tone' => 'invalid_tone',
                'default_length' => ResponseLength::MEDIUM->value,
                'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tone']);
    }

    public function test_profile_builds_system_prompt(): void
    {
        $profile = LocationResponseProfile::create([
            'location_id' => $this->location->id,
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
            'signature' => 'L\'équipe',
            'tone' => ResponseTone::WARM->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            'include_customer_name' => true,
            'include_business_name' => true,
            'include_emojis' => false,
            'include_invitation' => true,
            'include_signature' => true,
            'highlights' => 'Notre chef étoilé',
            'avoid_topics' => 'Les prix',
            'additional_context' => 'Restaurant familial depuis 50 ans',
            'onboarding_completed' => true,
        ]);

        $prompt = $profile->buildSystemPrompt(5); // Positive review

        $this->assertStringContainsString('Le Petit Bistrot', $prompt);
        $this->assertStringContainsString('Restaurant / Café / Bar', $prompt);
        $this->assertStringContainsString('Notre chef étoilé', $prompt);
        $this->assertStringContainsString('Les prix', $prompt);
        $this->assertStringContainsString('Restaurant familial depuis 50 ans', $prompt);
        $this->assertStringContainsString('L\'équipe', $prompt);
        $this->assertStringContainsString('positif', $prompt);
    }

    public function test_profile_builds_prompt_for_negative_review(): void
    {
        $profile = LocationResponseProfile::create([
            'location_id' => $this->location->id,
            'business_sector' => BusinessSector::RESTAURANT->value,
            'business_name' => 'Le Petit Bistrot',
            'tone' => ResponseTone::WARM->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::SOLUTION->value,
            'onboarding_completed' => true,
        ]);

        $prompt = $profile->buildSystemPrompt(1); // Negative review

        $this->assertStringContainsString('solution', $prompt);
        $this->assertStringContainsString('négatif', $prompt);
    }

    public function test_organization_member_can_access_location_profile(): void
    {
        // Create organization and location
        $organization = \App\Models\Organization::factory()->create([
            'owner_id' => $this->user->id,
        ]);

        $this->location->update(['organization_id' => $organization->id]);
        $this->user->update(['organization_id' => $organization->id]);

        // Create another user in the same organization
        $orgMember = User::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $response = $this->actingAs($orgMember)
            ->getJson("/api/locations/{$this->location->id}/response-profile");

        $response->assertOk();
    }
}
