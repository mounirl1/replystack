<?php

namespace Tests\Unit\Services\Google;

use App\Models\Review;
use App\Models\ReviewConnection;
use App\Services\Google\GoogleBusinessAccountService;
use App\Services\Google\GoogleBusinessAuthService;
use App\Services\Google\GoogleBusinessReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class GoogleBusinessReviewServiceTest extends TestCase
{
    use RefreshDatabase;

    private GoogleBusinessReviewService $service;
    private MockInterface $authServiceMock;
    private MockInterface $accountServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'https://api.reply-stack.app/api/google/callback',
        ]);

        $this->authServiceMock = Mockery::mock(GoogleBusinessAuthService::class);
        $this->accountServiceMock = Mockery::mock(GoogleBusinessAccountService::class);

        $this->service = new GoogleBusinessReviewService(
            $this->authServiceMock,
            $this->accountServiceMock
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ========================================
    // getReviews() Tests
    // ========================================

    public function test_fetches_reviews_from_google_api(): void
    {
        $connection = ReviewConnection::factory()->google()->create();

        $this->authServiceMock
            ->shouldReceive('getValidAccessToken')
            ->with(Mockery::on(fn ($arg) => $arg->id === $connection->id))
            ->once()
            ->andReturn('valid-access-token');

        $this->accountServiceMock
            ->shouldReceive('getFullLocationName')
            ->with(Mockery::on(fn ($arg) => $arg->id === $connection->id))
            ->once()
            ->andReturn('accounts/123/locations/456');

        Http::fake([
            'mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews*' => Http::response([
                'reviews' => [
                    [
                        'name' => 'accounts/123/locations/456/reviews/review-1',
                        'reviewId' => 'review-1',
                        'reviewer' => [
                            'displayName' => 'Alice',
                            'profilePhotoUrl' => 'https://example.com/alice.jpg',
                        ],
                        'starRating' => 'FIVE',
                        'comment' => 'Excellent place!',
                        'createTime' => '2026-01-15T10:00:00Z',
                    ],
                    [
                        'name' => 'accounts/123/locations/456/reviews/review-2',
                        'reviewId' => 'review-2',
                        'reviewer' => [
                            'displayName' => 'Bob',
                        ],
                        'starRating' => 'TWO',
                        'comment' => 'Not great.',
                        'createTime' => '2026-01-14T09:00:00Z',
                    ],
                ],
                'totalReviewCount' => 2,
                'nextPageToken' => null,
            ], 200),
        ]);

        $result = $this->service->getReviews($connection, 50);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('reviews', $result);
        $this->assertArrayHasKey('totalReviewCount', $result);
        $this->assertArrayHasKey('nextPageToken', $result);
        $this->assertCount(2, $result['reviews']);
        $this->assertEquals(2, $result['totalReviewCount']);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews')
                && $request->hasHeader('Authorization', 'Bearer valid-access-token');
        });
    }

    // ========================================
    // transformReview() Tests
    // ========================================

    public function test_transforms_review_data(): void
    {
        $googleReview = [
            'name' => 'accounts/123/locations/456/reviews/abc123',
            'reviewId' => 'abc123',
            'reviewer' => [
                'displayName' => 'Jane Doe',
                'profilePhotoUrl' => 'https://example.com/jane.jpg',
            ],
            'starRating' => 'FOUR',
            'comment' => 'Really enjoyable experience!',
            'createTime' => '2026-02-01T14:30:00Z',
        ];

        $result = $this->service->transformReview($googleReview);

        $this->assertEquals('abc123', $result['external_id']);
        $this->assertEquals('google', $result['platform']);
        $this->assertEquals('abc123', $result['platform_review_id']);
        $this->assertEquals('Jane Doe', $result['author_name']);
        $this->assertEquals('https://example.com/jane.jpg', $result['author_avatar']);
        $this->assertEquals(4, $result['rating']);
        $this->assertEquals('Really enjoyable experience!', $result['content']);
        $this->assertFalse($result['has_response']);
        $this->assertNull($result['response_content']);
        $this->assertEquals('pending', $result['status']);
    }

    public function test_transforms_review_with_reply(): void
    {
        $googleReview = [
            'name' => 'accounts/123/locations/456/reviews/def456',
            'reviewId' => 'def456',
            'reviewer' => [
                'displayName' => 'John',
            ],
            'starRating' => 'THREE',
            'comment' => 'Average.',
            'createTime' => '2026-01-20T08:00:00Z',
            'reviewReply' => [
                'comment' => 'Thank you for your feedback!',
                'updateTime' => '2026-01-21T10:00:00Z',
            ],
        ];

        $result = $this->service->transformReview($googleReview);

        $this->assertTrue($result['has_response']);
        $this->assertEquals('Thank you for your feedback!', $result['response_content']);
        $this->assertEquals('replied', $result['status']);
        $this->assertNotNull($result['response_published_at']);
    }

    public function test_transforms_review_maps_star_ratings(): void
    {
        $ratings = [
            'ONE' => 1,
            'TWO' => 2,
            'THREE' => 3,
            'FOUR' => 4,
            'FIVE' => 5,
        ];

        foreach ($ratings as $starRating => $expected) {
            $googleReview = [
                'name' => "accounts/1/locations/1/reviews/r-{$expected}",
                'starRating' => $starRating,
                'reviewer' => ['displayName' => 'Test'],
                'comment' => 'Test',
                'createTime' => '2026-01-01T00:00:00Z',
            ];

            $result = $this->service->transformReview($googleReview);
            $this->assertEquals($expected, $result['rating'], "Star rating {$starRating} should map to {$expected}");
        }
    }

    // ========================================
    // replyToReview() Tests
    // ========================================

    public function test_replies_to_review(): void
    {
        $connection = ReviewConnection::factory()->google()->create([
            'account_name' => 'accounts/123',
            'location_id_google' => 'locations/456',
        ]);

        $review = Review::factory()->create([
            'review_connection_id' => $connection->id,
            'location_id' => $connection->location_id,
            'platform' => 'google',
            'external_id' => 'review-xyz',
            'status' => 'pending',
        ]);

        $this->authServiceMock
            ->shouldReceive('getValidAccessToken')
            ->once()
            ->andReturn('valid-access-token');

        $this->accountServiceMock
            ->shouldReceive('getFullLocationName')
            ->once()
            ->andReturn('accounts/123/locations/456');

        Http::fake([
            'mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews/review-xyz/reply' => Http::response([
                'comment' => 'Thank you for your review!',
                'updateTime' => '2026-02-12T10:00:00Z',
            ], 200),
        ]);

        $result = $this->service->replyToReview($review, 'Thank you for your review!');

        $this->assertTrue($result);

        $review->refresh();
        $this->assertEquals('replied', $review->status);
        $this->assertTrue($review->has_response);
        $this->assertEquals('Thank you for your review!', $review->response_content);
        $this->assertNotNull($review->replied_at);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'reviews/review-xyz/reply')
                && $request->method() === 'PUT'
                && $request['comment'] === 'Thank you for your review!';
        });
    }
}
