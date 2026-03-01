<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\Location;
use App\Models\MagicToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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
        $user = new User();
        $user->forceFill([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name,
            'plan' => 'free',
            'monthly_quota' => 10,
        ]);
        $user->save();

        // Create default location for the user
        Location::create([
            'user_id' => $user->id,
            'name' => 'Mon établissement',
            'default_tone' => 'professional',
            'default_language' => 'auto',
        ]);

        // Send email verification
        $this->sendVerificationEmail($user);

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

        // Revoke all existing tokens for security (prevents token accumulation)
        $user->tokens()->delete();

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

        // Validate redirect_url against whitelist to prevent open redirect
        if ($redirectUrl) {
            $allowedHosts = [
                'reply-stack.app',
                'www.reply-stack.app',
                'localhost',
            ];

            $parsed = parse_url($redirectUrl);
            $host = $parsed['host'] ?? '';

            if (!in_array($host, $allowedHosts, true)) {
                $redirectUrl = null; // Discard untrusted redirect
            }
        }

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

    /**
     * Send a password reset link to the given email.
     *
     * Always returns success to prevent email enumeration attacks.
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if ($user) {
            // Delete any existing tokens for this email
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // Generate a new token
            $token = Str::random(64);

            // Store the token
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Build reset URL
            $frontendUrl = config('app.frontend_url', 'https://www.reply-stack.app');
            $resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($request->email);

            // Send email
            Mail::to($user->email)->send(new PasswordResetMail(
                resetUrl: $resetUrl,
                userName: $user->name ?? explode('@', $user->email)[0],
            ));
        }

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => __('api.auth.password_reset_link_sent'),
        ]);
    }

    /**
     * Reset the user's password with a valid token.
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        // Find the token record
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$tokenRecord) {
            return response()->json([
                'message' => __('api.auth.invalid_reset_token'),
            ], 400);
        }

        // Check if token is expired (60 minutes)
        $createdAt = \Carbon\Carbon::parse($tokenRecord->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            // Delete expired token
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => __('api.auth.reset_token_expired'),
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $tokenRecord->token)) {
            return response()->json([
                'message' => __('api.auth.invalid_reset_token'),
            ], 400);
        }

        // Find user and update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => __('api.auth.invalid_reset_token'),
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        // Create a new token for immediate login
        $token = $user->createToken('api-token')->plainTextToken;

        // Load organization relationship
        $user->load('organization');

        return response()->json([
            'message' => __('api.auth.password_reset_success'),
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Verify email address with token.
     *
     * @param string $token
     * @return JsonResponse
     */
    public function verifyEmail(string $token): JsonResponse
    {
        // Tokens are stored hashed; we must iterate over user's tokens and check each
        // Since tokens are scoped per-user via the email link, we check all recent tokens
        $records = DB::table('email_verification_tokens')
            ->where('created_at', '>=', now()->subHours(24))
            ->get();

        $matchedRecord = null;
        foreach ($records as $record) {
            if (Hash::check($token, $record->token)) {
                $matchedRecord = $record;
                break;
            }
        }

        if (!$matchedRecord) {
            return response()->json([
                'message' => __('api.auth.invalid_verification_token'),
            ], 400);
        }

        // Check if token is expired (24 hours)
        $createdAt = \Carbon\Carbon::parse($matchedRecord->created_at);
        if ($createdAt->addHours(24)->isPast()) {
            DB::table('email_verification_tokens')->where('id', $matchedRecord->id)->delete();

            return response()->json([
                'message' => __('api.auth.verification_token_expired'),
            ], 400);
        }

        $user = User::find($matchedRecord->user_id);

        if (!$user) {
            DB::table('email_verification_tokens')->where('id', $matchedRecord->id)->delete();

            return response()->json([
                'message' => __('api.auth.invalid_verification_token'),
            ], 400);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->save();

        // Delete all verification tokens for this user
        DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();

        return response()->json([
            'message' => __('api.auth.email_verified'),
        ]);
    }

    /**
     * Resend verification email.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'message' => __('api.auth.email_already_verified'),
            ]);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'message' => __('api.auth.verification_email_sent'),
        ]);
    }

    /**
     * Send verification email to user.
     */
    protected function sendVerificationEmail(User $user): void
    {
        // Delete any existing tokens for this user
        DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();

        // Generate a new token
        $token = Str::random(64);

        // Store the hashed token (plaintext sent via email, hash stored in DB)
        DB::table('email_verification_tokens')->insert([
            'user_id' => $user->id,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Build verification URL
        $frontendUrl = config('app.frontend_url', 'https://www.reply-stack.app');
        $verificationUrl = "{$frontendUrl}/verify-email?token={$token}";

        // Send email
        Mail::to($user->email)->send(new EmailVerificationMail(
            verificationUrl: $verificationUrl,
            userName: $user->name ?? explode('@', $user->email)[0],
        ));
    }
}
