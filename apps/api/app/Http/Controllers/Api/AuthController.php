<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Location;
use App\Models\MagicToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Authentication Controller
 *
 * Handles user registration, login, logout, and profile retrieval.
 */
class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * Creates a new user account with the 'free' plan and generates
     * an API token for immediate authentication.
     *
     * @param RegisterRequest $request Validated registration data
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name,
            'plan' => 'free',
            'monthly_quota' => 10,
        ]);

        // Create default location for the user
        Location::create([
            'user_id' => $user->id,
            'name' => 'Mon établissement',
            'default_tone' => 'professional',
            'default_language' => 'auto',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => __('api.auth.registered'),
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate a user and generate an API token.
     *
     * Validates credentials and returns user data with a new API token.
     * Implements rate limiting through the LoginRequest.
     *
     * @param LoginRequest $request Validated login credentials
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        /** @var User $user */
        $user = Auth::user();

        // Revoke all existing tokens for this user (optional: single session)
        // $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        // Load organization if exists
        $user->load('organization');

        return response()->json([
            'message' => __('api.auth.logged_in'),
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout the authenticated user.
     *
     * Revokes the current API token used for the request.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Revoke the token that was used to authenticate the current request
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => __('api.auth.logged_out'),
        ]);
    }

    /**
     * Get the authenticated user's profile.
     *
     * Returns user information including plan details, quota status,
     * and organization membership if applicable.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Load organization relationship
        $user->load('organization');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Revoke all tokens for the authenticated user.
     *
     * Useful for "logout from all devices" functionality.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->tokens()->delete();

        return response()->json([
            'message' => __('api.auth.all_devices_logged_out'),
        ]);
    }

    /**
     * Create a magic token for cross-platform authentication.
     *
     * Generates a one-time-use token that can be used to authenticate
     * on the web app without re-entering credentials.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createMagicToken(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $redirectUrl = $request->input('redirect_url');

        $magicToken = MagicToken::generateFor($user, $redirectUrl);

        return response()->json([
            'token' => $magicToken->token,
            'expires_at' => $magicToken->expires_at->toIso8601String(),
        ]);
    }

    /**
     * Validate a magic token and authenticate the user.
     *
     * Consumes the token (one-time use) and returns user data with a new API token.
     *
     * @param string $token
     * @return JsonResponse
     */
    public function validateMagicToken(string $token): JsonResponse
    {
        $magicToken = MagicToken::findValid($token);

        if (!$magicToken) {
            return response()->json([
                'message' => __('api.auth.invalid_magic_token'),
            ], 401);
        }

        // Mark token as used
        $magicToken->markAsUsed();

        // Get the user and create a new API token
        $user = $magicToken->user;
        $apiToken = $user->createToken('web-magic-token')->plainTextToken;

        // Load organization relationship
        $user->load('organization');

        return response()->json([
            'message' => __('api.auth.magic_token_valid'),
            'user' => new UserResource($user),
            'token' => $apiToken,
            'redirect_url' => $magicToken->redirect_url,
        ]);
    }
}
