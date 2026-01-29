<?php

namespace Tests\Unit\Services\Admin;

use App\Services\Admin\AICostCalculatorService;
use Tests\TestCase;

class AICostCalculatorServiceTest extends TestCase
{
    private AICostCalculatorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AICostCalculatorService();
    }

    /**
     * Test cost calculation for Gemini.
     */
    public function test_calculates_cost_for_gemini(): void
    {
        // 1 million tokens at $0.2325/M = $0.2325
        $cost = $this->service->calculateCost(1_000_000, 'gemini');
        $this->assertEquals(0.2325, $cost);

        // 500,000 tokens = $0.11625
        $cost = $this->service->calculateCost(500_000, 'gemini');
        $this->assertEquals(0.1163, $cost); // Rounded to 4 decimals
    }

    /**
     * Test cost calculation for Mistral.
     */
    public function test_calculates_cost_for_mistral(): void
    {
        // 1 million tokens at $0.25/M = $0.25
        $cost = $this->service->calculateCost(1_000_000, 'mistral');
        $this->assertEquals(0.25, $cost);
    }

    /**
     * Test cost calculation for zero tokens.
     */
    public function test_returns_zero_for_zero_tokens(): void
    {
        $cost = $this->service->calculateCost(0, 'gemini');
        $this->assertEquals(0.0, $cost);
    }

    /**
     * Test cost calculation for negative tokens.
     */
    public function test_returns_zero_for_negative_tokens(): void
    {
        $cost = $this->service->calculateCost(-100, 'gemini');
        $this->assertEquals(0.0, $cost);
    }

    /**
     * Test unknown provider uses default rate.
     */
    public function test_unknown_provider_uses_default_rate(): void
    {
        // Unknown provider should use default of $0.25/M
        $cost = $this->service->calculateCost(1_000_000, 'unknown');
        $this->assertEquals(0.25, $cost);
    }

    /**
     * Test get pricing returns all providers.
     */
    public function test_get_pricing_returns_all_providers(): void
    {
        $pricing = $this->service->getPricing();

        $this->assertArrayHasKey('gemini', $pricing);
        $this->assertArrayHasKey('mistral', $pricing);
        $this->assertArrayHasKey('claude', $pricing);

        $this->assertArrayHasKey('cost_per_million_tokens', $pricing['gemini']);
        $this->assertArrayHasKey('description', $pricing['gemini']);
    }

    /**
     * Test small token amounts.
     */
    public function test_calculates_cost_for_small_amounts(): void
    {
        // 1000 tokens = very small cost
        $cost = $this->service->calculateCost(1000, 'gemini');
        $this->assertEquals(0.0002, $cost);

        // 100 tokens
        $cost = $this->service->calculateCost(100, 'gemini');
        $this->assertEquals(0.0, $cost); // Rounds to 0
    }

    /**
     * Test large token amounts.
     */
    public function test_calculates_cost_for_large_amounts(): void
    {
        // 100 million tokens
        $cost = $this->service->calculateCost(100_000_000, 'gemini');
        $this->assertEquals(23.25, $cost);
    }
}
