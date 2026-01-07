<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeController extends Controller
{
    /**
     * Create a Stripe checkout session for plan upgrade.
     */
    public function checkout(Request $request): JsonResponse
    {
        // TODO: Implement checkout session creation
        return response()->json([
            'message' => 'Stripe checkout not yet implemented',
        ], 501);
    }

    /**
     * Create a Stripe customer portal session.
     */
    public function portal(Request $request): JsonResponse
    {
        // TODO: Implement customer portal session creation
        return response()->json([
            'message' => 'Stripe portal not yet implemented',
        ], 501);
    }

    /**
     * Handle Stripe webhook events with signature verification.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        // Verify webhook signature
        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::warning('Stripe webhook: Invalid payload', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::warning('Stripe webhook: Invalid signature', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        try {
            switch ($event->type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;

                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;

                case 'invoice.payment_succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;

                case 'invoice.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;

                default:
                    Log::info('Stripe webhook: Unhandled event type', [
                        'type' => $event->type,
                    ]);
            }
        } catch (\Exception $e) {
            Log::error('Stripe webhook: Error processing event', [
                'type' => $event->type,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle subscription created or updated.
     */
    private function handleSubscriptionUpdated($subscription): void
    {
        $customerId = $subscription->customer;
        $status = $subscription->status;

        $user = User::where('stripe_customer_id', $customerId)->first();

        if (!$user) {
            Log::warning('Stripe webhook: User not found for customer', [
                'customer_id' => $customerId,
            ]);
            return;
        }

        // Determine plan from subscription metadata or price ID
        $plan = $this->determinePlanFromSubscription($subscription);

        // Only update if subscription is active
        if ($status === 'active') {
            $user->setQuotaForPlan($plan);
            $user->update([
                'stripe_subscription_id' => $subscription->id,
            ]);

            Log::info('Stripe webhook: Subscription updated', [
                'user_id' => $user->id,
                'plan' => $plan,
                'status' => $status,
            ]);
        }
    }

    /**
     * Handle subscription deleted/cancelled.
     */
    private function handleSubscriptionDeleted($subscription): void
    {
        $customerId = $subscription->customer;

        $user = User::where('stripe_customer_id', $customerId)->first();

        if (!$user) {
            Log::warning('Stripe webhook: User not found for customer', [
                'customer_id' => $customerId,
            ]);
            return;
        }

        // Downgrade to free plan
        $user->setQuotaForPlan('free');
        $user->update([
            'stripe_subscription_id' => null,
        ]);

        Log::info('Stripe webhook: Subscription cancelled', [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Handle successful payment.
     */
    private function handlePaymentSucceeded($invoice): void
    {
        $customerId = $invoice->customer;

        Log::info('Stripe webhook: Payment succeeded', [
            'customer_id' => $customerId,
            'amount' => $invoice->amount_paid,
        ]);

        // Quota is already updated by subscription events
        // This is just for logging/notifications
    }

    /**
     * Handle failed payment.
     */
    private function handlePaymentFailed($invoice): void
    {
        $customerId = $invoice->customer;

        $user = User::where('stripe_customer_id', $customerId)->first();

        if ($user) {
            Log::warning('Stripe webhook: Payment failed', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
            ]);

            // TODO: Send email notification to user
        }
    }

    /**
     * Determine plan from Stripe subscription.
     */
    private function determinePlanFromSubscription($subscription): string
    {
        // Get the price ID from the subscription items
        $priceId = $subscription->items->data[0]->price->id ?? null;

        // Map price IDs to plans (these should match your Stripe products)
        $priceMap = [
            env('STRIPE_PRICE_STARTER') => 'starter',
            env('STRIPE_PRICE_PRO') => 'pro',
            env('STRIPE_PRICE_BUSINESS') => 'business',
        ];

        return $priceMap[$priceId] ?? 'starter';
    }
}
