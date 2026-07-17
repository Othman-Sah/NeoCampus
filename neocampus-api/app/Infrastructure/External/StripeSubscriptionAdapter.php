<?php

namespace App\Infrastructure\External;

use App\Domain\Ports\SubscriptionPortInterface;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Log;

class StripeSubscriptionAdapter implements SubscriptionPortInterface
{
    /**
     * Create a Stripe Checkout Session.
     */
    public function createCheckoutSession(Etablissement $etablissement, string $planTier): string
    {
        // In production, you would configure Stripe API and call:
        // \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        // $session = \Stripe\Checkout\Session::create([...]);
        // return $session->url;
        
        // Mock Stripe checkout session URL
        $mockSessionId = 'cs_test_' . uniqid();
        
        // Save temporary/mock stripe customer ID if not exists
        if (!$etablissement->stripe_customer_id) {
            $etablissement->update([
                'stripe_customer_id' => 'cus_' . uniqid()
            ]);
        }

        Log::info("Mock Stripe Checkout Session created for Etablissement ID {$etablissement->id} (tier: {$planTier})");

        // Returns a redirect URL to our mock success redirect or simulation path
        return url("/api/v1/billing/checkout-success?session_id={$mockSessionId}&establishment_id={$etablissement->id}&tier={$planTier}");
    }

    /**
     * Create a Stripe Customer Portal Session.
     */
    public function createPortalSession(Etablissement $etablissement): string
    {
        // Mock Stripe customer portal URL
        Log::info("Mock Stripe Customer Portal Session created for Etablissement ID {$etablissement->id}");
        
        return "https://billing.stripe.com/p/session/mock_" . uniqid();
    }

    /**
     * Handle Stripe Webhook event.
     */
    public function handleWebhook(array $payload): void
    {
        $eventType = $payload['type'] ?? '';
        $dataObject = $payload['data']['object'] ?? [];

        Log::info("Stripe Webhook Event Received: {$eventType}", ['payload' => $payload]);

        if (in_array($eventType, ['customer.subscription.created', 'customer.subscription.updated'])) {
            $stripeCustomerId = $dataObject['customer'] ?? '';
            $subscriptionId = $dataObject['id'] ?? '';
            $status = $dataObject['status'] ?? '';
            
            // Extract metadata or plan info
            $establishmentId = $dataObject['metadata']['establishment_id'] ?? null;
            $priceId = $dataObject['items']['data'][0]['price']['id'] ?? '';
            
            // Map status
            $subStatus = match ($status) {
                'active' => 'active',
                'trialing' => 'trialing',
                'past_due' => 'past_due',
                'canceled' => 'canceled',
                'unpaid' => 'past_due',
                default => 'trialing',
            };

            // Map price/plan ID to plan_tier (mock price mappings or metadata)
            $planTier = $dataObject['metadata']['plan_tier'] ?? 'basic';

            $query = Etablissement::query();
            if ($establishmentId) {
                $etablissement = $query->find($establishmentId);
            } else {
                $etablissement = $query->where('stripe_customer_id', $stripeCustomerId)->first();
            }

            if ($etablissement) {
                $etablissement->update([
                    'stripe_subscription_id' => $subscriptionId,
                    'stripe_customer_id' => $stripeCustomerId ?: $etablissement->stripe_customer_id,
                    'subscription_status' => $subStatus,
                    'plan_tier' => $planTier,
                    'subscription_ends_at' => isset($dataObject['current_period_end']) 
                        ? now()->setTimestamp($dataObject['current_period_end']) 
                        : now()->addMonth(),
                ]);

                // Update limits on the establishment settings
                $etablissement->setSetting('max_branches', match($planTier) {
                    'free' => 1,
                    'basic' => 1,
                    'premium' => 5,
                    'enterprise' => 999,
                    default => 1,
                });

                $etablissement->setSetting('max_students', match($planTier) {
                    'free' => 50,
                    'basic' => 200,
                    'premium' => 1000,
                    'enterprise' => 99999,
                    default => 50,
                });

                Log::info("Etablissement ID {$etablissement->id} subscription updated to {$subStatus} (Tier: {$planTier}) via webhook.");
            }
        }

        if ($eventType === 'customer.subscription.deleted') {
            $subscriptionId = $dataObject['id'] ?? '';
            $etablissement = Etablissement::where('stripe_subscription_id', $subscriptionId)->first();

            if ($etablissement) {
                $etablissement->update([
                    'subscription_status' => 'canceled',
                ]);
                Log::info("Etablissement ID {$etablissement->id} subscription canceled via webhook.");
            }
        }
    }
}
