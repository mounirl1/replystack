<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LemonSqueezyController extends Controller
{
    /**
     * Create a checkout session for a subscription plan.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan' => 'required|in:starter,pro,business',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = $validated['plan'];
        $billingCycle = $validated['billing_cycle'];

        // Get variant ID for the plan and billing cycle
        $variantId = $this->getVariantIdForPlan($plan, $billingCycle);

        if (!$variantId) {
            return response()->json([
                'error' => 'Invalid plan configuration',
            ], 500);
        }

        try {
            // Create checkout session using LemonSqueezy API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.lemonsqueezy.api_key'),
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ])->post('https://api.lemonsqueezy.com/v1/checkouts', [
                'data' => [
                    'type' => 'checkouts',
                    'attributes' => [
                        'checkout_data' => [
                            'email' => $user->email,
                            'custom' => [
                                'user_id' => (string) $user->id,
                            ],
                        ],
                    ],
                    'relationships' => [
                        'store' => [
                            'data' => [
                                'type' => 'stores',
                                'id' => (string) config('services.lemonsqueezy.store_id'),
                            ],
                        ],
                        'variant' => [
                            'data' => [
                                'type' => 'variants',
                                'id' => (string) $variantId,
                            ],
                        ],
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::error('LemonSqueezy checkout creation failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return response()->json([
                    'error' => 'Failed to create checkout session',
                ], 500);
            }

            $checkoutData = $response->json();
            $checkoutUrl = $checkoutData['data']['attributes']['url'] ?? null;

            if (!$checkoutUrl) {
                return response()->json([
                    'error' => 'Checkout URL not found',
                ], 500);
            }

            return response()->json([
                'url' => $checkoutUrl,
            ]);

        } catch (\Exception $e) {
            Log::error('LemonSqueezy checkout exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An error occurred while creating checkout',
            ], 500);
        }
    }

    /**
     * Get the customer portal URL for managing subscription.
     */
    public function portal(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasActiveSubscription()) {
            return response()->json([
                'error' => 'No active subscription found',
            ], 404);
        }

        try {
            // Fetch subscription details from LemonSqueezy
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.lemonsqueezy.api_key'),
                'Accept' => 'application/vnd.api+json',
            ])->get('https://api.lemonsqueezy.com/v1/subscriptions/' . $user->getLemonSubscriptionId());

            if ($response->failed()) {
                Log::error('LemonSqueezy subscription fetch failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return response()->json([
                    'error' => 'Failed to fetch subscription',
                ], 500);
            }

            $subscriptionData = $response->json();
            $portalUrl = $subscriptionData['data']['attributes']['urls']['customer_portal'] ?? null;

            if (!$portalUrl) {
                return response()->json([
                    'error' => 'Portal URL not found',
                ], 500);
            }

            return response()->json([
                'url' => $portalUrl,
            ]);

        } catch (\Exception $e) {
            Log::error('LemonSqueezy portal exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching portal URL',
            ], 500);
        }
    }

    /**
     * Handle LemonSqueezy webhook events.
     */
    public function webhook(Request $request): JsonResponse
    {
        // Verify webhook signature
        if (!$this->verifySignature($request)) {
            Log::warning('LemonSqueezy webhook signature verification failed');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        $eventName = $payload['meta']['event_name'] ?? null;

        Log::info('LemonSqueezy webhook received', [
            'event' => $eventName,
            'payload' => $payload,
        ]);

        try {
            switch ($eventName) {
                case 'subscription_created':
                    $this->handleSubscriptionCreated($payload);
                    break;

                case 'subscription_updated':
                    $this->handleSubscriptionUpdated($payload);
                    break;

                case 'subscription_cancelled':
                case 'subscription_expired':
                    $this->handleSubscriptionCancelled($payload);
                    break;

                case 'subscription_payment_success':
                    $this->handlePaymentSuccess($payload);
                    break;

                case 'subscription_payment_failed':
                    $this->handlePaymentFailed($payload);
                    break;

                case 'order_created':
                    $this->handleOrderCreated($payload);
                    break;

                default:
                    Log::info('LemonSqueezy webhook event not handled', ['event' => $eventName]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('LemonSqueezy webhook processing error', [
                'event' => $eventName,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle subscription_created event.
     */
    private function handleSubscriptionCreated(array $payload): void
    {
        $customData = $payload['meta']['custom_data'] ?? [];
        $userId = $customData['user_id'] ?? null;

        if (!$userId) {
            Log::error('LemonSqueezy webhook: user_id not found in custom_data');
            return;
        }

        $user = User::find($userId);
        if (!$user) {
            Log::error('LemonSqueezy webhook: user not found', ['user_id' => $userId]);
            return;
        }

        $attributes = $payload['data']['attributes'];
        $variantId = $attributes['variant_id'];
        $plan = $this->determinePlanFromVariant($variantId);

        $user->update([
            'lemon_customer_id' => $attributes['customer_id'],
            'lemon_subscription_id' => $attributes['id'],
            'lemon_variant_id' => $variantId,
            'plan' => $plan,
        ]);

        // Set quota based on plan
        $user->setQuotaForPlan($plan);

        Log::info('Subscription created', [
            'user_id' => $userId,
            'plan' => $plan,
        ]);
    }

    /**
     * Handle subscription_updated event.
     */
    private function handleSubscriptionUpdated(array $payload): void
    {
        $subscriptionId = $payload['data']['attributes']['id'];
        $user = User::where('lemon_subscription_id', $subscriptionId)->first();

        if (!$user) {
            Log::error('LemonSqueezy webhook: user not found for subscription', [
                'subscription_id' => $subscriptionId,
            ]);
            return;
        }

        $attributes = $payload['data']['attributes'];
        $newVariantId = $attributes['variant_id'];
        $newPlan = $this->determinePlanFromVariant($newVariantId);

        // Check if plan changed
        if ($user->plan !== $newPlan) {
            $user->update([
                'lemon_variant_id' => $newVariantId,
                'plan' => $newPlan,
            ]);

            // Update quota for new plan
            $user->setQuotaForPlan($newPlan);

            Log::info('Subscription plan changed', [
                'user_id' => $user->id,
                'old_plan' => $user->plan,
                'new_plan' => $newPlan,
            ]);
        }
    }

    /**
     * Handle subscription_cancelled/subscription_expired event.
     */
    private function handleSubscriptionCancelled(array $payload): void
    {
        $subscriptionId = $payload['data']['attributes']['id'];
        $user = User::where('lemon_subscription_id', $subscriptionId)->first();

        if (!$user) {
            Log::error('LemonSqueezy webhook: user not found for subscription', [
                'subscription_id' => $subscriptionId,
            ]);
            return;
        }

        // Downgrade to free plan
        $user->update([
            'plan' => 'free',
            'lemon_subscription_id' => null,
            'lemon_variant_id' => null,
        ]);

        // Set free plan quota
        $user->setQuotaForPlan('free');

        Log::info('Subscription cancelled/expired', [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Handle subscription_payment_success event.
     */
    private function handlePaymentSuccess(array $payload): void
    {
        $subscriptionId = $payload['data']['attributes']['id'];

        Log::info('Payment succeeded', [
            'subscription_id' => $subscriptionId,
        ]);

        // Could send confirmation email here
    }

    /**
     * Handle subscription_payment_failed event.
     */
    private function handlePaymentFailed(array $payload): void
    {
        $subscriptionId = $payload['data']['attributes']['id'];

        Log::warning('Payment failed', [
            'subscription_id' => $subscriptionId,
        ]);

        // TODO: Send payment failed notification email
    }

    /**
     * Handle order_created event.
     */
    private function handleOrderCreated(array $payload): void
    {
        $customData = $payload['meta']['custom_data'] ?? [];
        $userId = $customData['user_id'] ?? null;

        if (!$userId) {
            return;
        }

        $user = User::find($userId);
        if (!$user) {
            return;
        }

        $attributes = $payload['data']['attributes'];
        $user->update([
            'lemon_order_id' => $attributes['id'],
        ]);

        Log::info('Order created', [
            'user_id' => $userId,
            'order_id' => $attributes['id'],
        ]);
    }

    /**
     * Verify webhook signature.
     */
    private function verifySignature(Request $request): bool
    {
        $signature = $request->header('X-Signature');
        $secret = config('services.lemonsqueezy.webhook_secret');

        if (!$signature || !$secret) {
            return false;
        }

        $payload = $request->getContent();
        $computedSignature = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computedSignature, $signature);
    }

    /**
     * Get variant ID for a plan and billing cycle.
     */
    private function getVariantIdForPlan(string $plan, string $billingCycle): ?string
    {
        $key = "variant_{$plan}_{$billingCycle}";
        return config("services.lemonsqueezy.{$key}");
    }

    /**
     * Determine plan from variant ID.
     */
    private function determinePlanFromVariant(string $variantId): string
    {
        $variants = [
            // Monthly variants
            config('services.lemonsqueezy.variant_starter_monthly') => 'starter',
            config('services.lemonsqueezy.variant_pro_monthly') => 'pro',
            config('services.lemonsqueezy.variant_business_monthly') => 'business',
            // Yearly variants
            config('services.lemonsqueezy.variant_starter_yearly') => 'starter',
            config('services.lemonsqueezy.variant_pro_yearly') => 'pro',
            config('services.lemonsqueezy.variant_business_yearly') => 'business',
        ];

        return $variants[$variantId] ?? 'free';
    }
}
