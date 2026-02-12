<?php

namespace Tests\Unit\Services\Google;

use App\Services\Google\GoogleBusinessAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleBusinessAuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private GoogleBusinessAuthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'https://api.reply-stack.app/api/google/callback',
        ]);

        $this->service = new GoogleBusinessAuthService();
    }

    // ========================================
    // getAuthUrl() Tests
    // ========================================

    public function test_generates_auth_url(): void
    {
        $url = $this->service->getAuthUrl(locationId: 42);

        $this->assertIsString($url);
        $this->assertStringStartsWith('https://accounts.google.com/o/oauth2/v2/auth?', $url);
        $this->assertStringContainsString('client_id=test-client-id', $url);
        $this->assertStringContainsString('redirect_uri=' . urlencode('https://api.reply-stack.app/api/google/callback'), $url);
        $this->assertStringContainsString('response_type=code', $url);
        $this->assertStringContainsString('access_type=offline', $url);
        $this->assertStringContainsString('prompt=consent', $url);
        $this->assertStringContainsString('scope=' . urlencode('https://www.googleapis.com/auth/business.manage'), $url);
        $this->assertStringContainsString('state=', $url);
    }

    // ========================================
    // handleCallback() Tests
    // ========================================

    public function test_handles_callback_exchanges_code(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
                'token_type' => 'Bearer',
            ], 200),
        ]);

        $result = $this->service->handleCallback('auth-code-123');

        $this->assertIsArray($result);
        $this->assertEquals('new-access-token', $result['access_token']);
        $this->assertEquals('new-refresh-token', $result['refresh_token']);
        $this->assertEquals(3600, $result['expires_in']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://oauth2.googleapis.com/token'
                && $request['code'] === 'auth-code-123'
                && $request['client_id'] === 'test-client-id'
                && $request['client_secret'] === 'test-client-secret'
                && $request['grant_type'] === 'authorization_code';
        });
    }

    public function test_handles_callback_throws_on_failure(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'error' => 'invalid_grant',
                'error_description' => 'Code has expired',
            ], 400),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/Failed to exchange authorization code/');

        $this->service->handleCallback('expired-code');
    }

    // ========================================
    // refreshAccessToken() Tests
    // ========================================

    public function test_refreshes_expired_token(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'refreshed-access-token',
                'expires_in' => 3600,
                'token_type' => 'Bearer',
            ], 200),
        ]);

        $result = $this->service->refreshAccessToken('my-refresh-token');

        $this->assertIsArray($result);
        $this->assertEquals('refreshed-access-token', $result['access_token']);
        $this->assertEquals(3600, $result['expires_in']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://oauth2.googleapis.com/token'
                && $request['refresh_token'] === 'my-refresh-token'
                && $request['client_id'] === 'test-client-id'
                && $request['client_secret'] === 'test-client-secret'
                && $request['grant_type'] === 'refresh_token';
        });
    }

    public function test_refresh_token_throws_on_failure(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'error' => 'invalid_grant',
                'error_description' => 'Token has been revoked',
            ], 400),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Failed to refresh access token');

        $this->service->refreshAccessToken('revoked-refresh-token');
    }
}
