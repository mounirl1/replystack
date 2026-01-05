<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check if user has remaining quota before processing requests.
 *
 * This middleware should be applied to routes that consume quota,
 * such as generating AI replies.
 */
class CheckQuota
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(Request): (Response) $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthenticated',
                'message' => 'Veuillez vous connecter pour continuer.',
            ], 401);
        }

        if (!$user->hasQuotaRemaining()) {
            return response()->json([
                'error' => 'QuotaExceeded',
                'message' => $this->getQuotaMessage($user),
                'plan' => $user->plan,
                'quota' => [
                    'remaining' => 0,
                    'used' => $user->quota_used,
                    'limit' => $user->quota_limit,
                    'resets_at' => $this->getResetDate($user),
                ],
                'upgrade_url' => config('app.frontend_url', config('app.url')) . '/pricing',
            ], 429);
        }

        return $next($request);
    }

    /**
     * Get the appropriate quota exceeded message based on user's plan.
     *
     * @param User $user
     * @return string
     */
    private function getQuotaMessage(User $user): string
    {
        return match ($user->plan) {
            'free' => 'Quota mensuel épuisé (10 réponses/mois). Passez à Starter pour 50 réponses/mois.',
            'starter' => 'Quota mensuel épuisé. Passez à Pro pour des réponses illimitées.',
            default => 'Quota épuisé.',
        };
    }

    /**
     * Get the quota reset date for the user.
     *
     * @param User $user
     * @return string|null
     */
    private function getResetDate(User $user): ?string
    {
        if (in_array($user->plan, ['pro', 'business', 'enterprise'])) {
            return null;
        }

        // Free and Starter: reset at start of next month
        return now()->addMonth()->startOfMonth()->toIso8601String();
    }
}
