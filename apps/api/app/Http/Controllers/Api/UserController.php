<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Quota\QuotaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * User Controller
 *
 * Handles user-related operations like quota checking and settings.
 */
class UserController extends Controller
{
    public function __construct(
        private readonly QuotaService $quotaService
    ) {}

    /**
     * Get the current user's quota status.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function quota(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $quotaStatus = $this->quotaService->getQuotaStatus($user);

        return response()->json([
            'quota' => $quotaStatus,
        ]);
    }

    /**
     * Update user settings.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateSettings(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'default_tone' => ['sometimes', 'string', 'in:professional,friendly,formal,casual'],
            'default_language' => ['sometimes', 'string', 'max:5'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => __('api.validation.failed'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Only update fields that were provided
        if (!empty($validated)) {
            $user->update($validated);
        }

        return response()->json([
            'message' => __('api.user.settings_updated'),
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'plan' => $user->plan,
            ],
        ]);
    }

    /**
     * Get user's usage history/statistics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function usage(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Get usage for the current period
        $responsesCount = $user->responses()->count();
        $responsesThisMonth = $user->responses()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $responsesToday = $user->responses()
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return response()->json([
            'usage' => [
                'total_responses' => $responsesCount,
                'responses_this_month' => $responsesThisMonth,
                'responses_today' => $responsesToday,
                'quota' => $this->quotaService->getQuotaStatus($user),
            ],
        ]);
    }

    /**
     * Delete user account.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'password' => ['required', 'current_password'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => __('api.user.password_incorrect'),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if user owns an organization
        if ($user->ownedOrganizations()->exists()) {
            return response()->json([
                'message' => __('api.user.must_transfer_organization'),
            ], 422);
        }

        // Revoke all tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();

        return response()->json([
            'message' => __('api.user.account_deleted'),
        ]);
    }
}
