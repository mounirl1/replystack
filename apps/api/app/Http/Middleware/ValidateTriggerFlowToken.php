<?php

namespace App\Http\Middleware;

use App\Services\Auth\TriggerFlowAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ValidateTriggerFlowToken Middleware
 *
 * Validates TriggerFlow bearer tokens for API access.
 * This middleware is used for routes that are accessed by TriggerFlow.
 */
class ValidateTriggerFlowToken
{
    public function __construct(
        private readonly TriggerFlowAuthService $authService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if TriggerFlow integration is configured
        if (!$this->authService->isConfigured()) {
            return response()->json([
                'message' => 'TriggerFlow integration is not configured',
            ], 503);
        }

        // Extract bearer token
        $token = $request->bearerToken();

        if (empty($token)) {
            return response()->json([
                'message' => 'Authorization token required',
            ], 401);
        }

        // Validate token with TriggerFlow
        $triggerFlowUser = $this->authService->validateToken($token);

        if ($triggerFlowUser === null) {
            return response()->json([
                'message' => 'Invalid or expired token',
            ], 401);
        }

        // Find or create local user
        $user = $this->authService->findOrCreateUser($triggerFlowUser);

        // Attach user to request (same as Sanctum does)
        $request->setUserResolver(fn () => $user);

        // Also store the original TriggerFlow token for potential API callbacks
        $request->attributes->set('triggerflow_token', $token);
        $request->attributes->set('triggerflow_user_data', $triggerFlowUser);

        return $next($request);
    }
}
