<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AI\AIProviderFactory;
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
        private readonly QuotaService $quotaService,
        private readonly AIProviderFactory $providerFactory
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
     * Get the response style status for the user's first location.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function responseStyleStatus(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Get first location (own or via organization)
        $location = $user->locations()->first()
            ?? $user->organization?->locations()->first();

        if (!$location) {
            return response()->json([
                'hasProfile' => false,
                'onboardingCompleted' => false,
                'locationId' => null,
            ]);
        }

        $profile = $location->responseProfile;

        return response()->json([
            'hasProfile' => $profile !== null,
            'onboardingCompleted' => $profile?->onboarding_completed ?? false,
            'locationId' => $location->id,
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
     * Update user's AI provider preference.
     *
     * PATCH /api/user/ai-provider
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateAiProvider(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Only paid users can change their AI provider
        if (!$user->hasPaidPlan()) {
            return response()->json([
                'error' => 'PaidPlanRequired',
                'message' => __('api.user.paid_plan_required'),
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'ai_provider' => ['required', 'string', 'in:' . implode(',', AIProviderFactory::ALL_PROVIDERS)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => __('api.validation.failed'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Check if the provider is available for this user
        if (!$this->providerFactory->isProviderAvailable($validated['ai_provider'], $user)) {
            return response()->json([
                'error' => 'ProviderNotAvailable',
                'message' => __('api.user.provider_not_available'),
            ], 403);
        }

        $user->update(['ai_provider' => $validated['ai_provider']]);

        return response()->json([
            'message' => __('api.user.ai_provider_updated'),
            'ai_provider' => $user->ai_provider,
            'available_providers' => $this->providerFactory->getAvailableProvidersForUser($user),
        ]);
    }

    /**
     * Get available AI providers for the user.
     *
     * GET /api/user/ai-providers
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAiProviders(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'current_provider' => $user->ai_provider ?? AIProviderFactory::DEFAULT_PROVIDER,
            'available_providers' => $this->providerFactory->getAvailableProvidersForUser($user),
            'can_change' => $user->hasPaidPlan(),
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
