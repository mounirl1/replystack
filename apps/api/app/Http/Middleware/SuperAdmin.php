<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SuperAdmin Middleware
 *
 * Restricts access to super admin users only.
 * Used for administrative features like enabling Apify for locations.
 */
class SuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Super admin access required',
            ], 403);
        }

        return $next($request);
    }
}
