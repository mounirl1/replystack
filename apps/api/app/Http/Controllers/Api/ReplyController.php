<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Response;
use App\Models\User;
use App\Services\AI\ReplyGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Reply Controller
 *
 * Handles AI-powered reply generation for reviews.
 */
class ReplyController extends Controller
{
    public function __construct(
        private readonly ReplyGeneratorService $replyGenerator
    ) {}

    /**
     * Generate an AI reply for a review.
     *
     * POST /api/replies/generate
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'review_content' => ['required', 'string', 'min:1', 'max:5000'],
            'review_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review_author' => ['required', 'string', 'max:255'],
            'platform' => ['required', 'string', 'in:' . implode(',', ReplyGeneratorService::PLATFORMS)],
            'tone' => ['sometimes', 'string', 'in:' . implode(',', ReplyGeneratorService::TONES)],
            'length' => ['sometimes', 'string', 'in:short,medium,detailed'],
            'language' => ['sometimes', 'string', 'max:5'],
            'location_id' => ['sometimes', 'integer', 'exists:locations,id'],
            'specific_context' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => __('api.validation.failed'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        /** @var User $user */
        $user = $request->user();

        // Check quota (middleware should handle this, but double-check)
        if (!$user->hasQuotaRemaining()) {
            return response()->json([
                'error' => 'QuotaExceeded',
                'message' => __('api.quota.exceeded'),
                'plan' => $user->plan,
                'upgrade_url' => config('app.frontend_url') . '/pricing',
            ], 429);
        }

        // Get location if provided
        $location = null;
        if (isset($validated['location_id'])) {
            $location = Location::where('id', $validated['location_id'])
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                    // Also allow access if user belongs to the same organization
                    if ($user->organization_id) {
                        $query->orWhere('organization_id', $user->organization_id);
                    }
                })
                ->first();

            if (!$location) {
                return response()->json([
                    'message' => __('api.locations.not_accessible'),
                ], 404);
            }
        }

        try {
            // Prepare review data
            $reviewData = [
                'content' => $validated['review_content'],
                'rating' => $validated['review_rating'],
                'author' => $validated['review_author'],
                'platform' => $validated['platform'],
            ];

            // Prepare options
            $options = [
                'tone' => $validated['tone'] ?? $location?->responseProfile?->tone ?? $location?->default_tone ?? 'professional',
                'length' => $validated['length'] ?? $location?->responseProfile?->default_length ?? 'medium',
                'language' => $validated['language'] ?? $location?->default_language ?? 'auto',
                'location' => $location,
                'specific_context' => $validated['specific_context'] ?? null,
            ];

            // Generate the reply
            $result = $this->replyGenerator->generate($reviewData, $options);

            // Decrement user quota
            $user->decrementQuota();

            // Save the response to database
            $response = Response::create([
                'user_id' => $user->id,
                'review_id' => null, // No review ID when generating from extension
                'content' => $result['reply'],
                'tone' => $result['tone'],
                'language' => $result['language'],
                'generation_time_ms' => $result['generation_time_ms'],
                'tokens_used' => $result['tokens_used'],
            ]);

            return response()->json([
                'reply' => $result['reply'],
                'tone' => $result['tone'],
                'length' => $result['length'],
                'language' => $result['language'],
                'tokens_used' => $result['tokens_used'],
                'generation_time_ms' => $result['generation_time_ms'],
                'response_id' => $response->id,
                'quota_remaining' => $user->quota_remaining,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'GenerationFailed',
                'message' => __('api.replies.generation_failed'),
            ], 500);
        }
    }

    /**
     * Get user's response history.
     *
     * GET /api/replies
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $responses = Response::where('user_id', $user->id)
            ->with('review:id,platform,author_name,rating')
            ->orderByDesc('created_at')
            ->cursorPaginate(20);

        return response()->json([
            'responses' => $responses->items(),
            'next_cursor' => $responses->nextCursor()?->encode(),
            'has_more' => $responses->hasMorePages(),
        ]);
    }

    /**
     * Get a specific response.
     *
     * GET /api/replies/{id}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $response = Response::where('id', $id)
            ->where('user_id', $user->id)
            ->with('review')
            ->first();

        if (!$response) {
            return response()->json([
                'message' => __('api.replies.not_found'),
            ], 404);
        }

        return response()->json([
            'response' => $response,
        ]);
    }
}
