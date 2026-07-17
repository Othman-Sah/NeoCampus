<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Ports\SubscriptionPortInterface;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BillingController extends Controller
{
    private SubscriptionPortInterface $subscriptionService;

    public function __construct(SubscriptionPortInterface $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Initiate Stripe checkout session for plan upgrade.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan_tier' => 'required|in:free,basic,premium,enterprise'
        ]);

        $user = $request->user();
        if (!$user || !$user->etablissement) {
            return response()->json(['message' => 'Establishment context missing'], Response::HTTP_BAD_REQUEST);
        }

        $url = $this->subscriptionService->createCheckoutSession($user->etablissement, $request->plan_tier);

        return response()->json(['url' => $url]);
    }

    /**
     * Redirect to Stripe billing customer portal.
     */
    public function portal(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->etablissement) {
            return response()->json(['message' => 'Establishment context missing'], Response::HTTP_BAD_REQUEST);
        }

        $url = $this->subscriptionService->createPortalSession($user->etablissement);

        return response()->json(['url' => $url]);
    }

    /**
     * Stripe Webhook endpoint.
     */
    public function webhook(Request $request)
    {
        $this->subscriptionService->handleWebhook($request->all());

        return response()->json(['status' => 'processed']);
    }

    /**
     * Mock Checkout success landing endpoint.
     */
    public function checkoutSuccess(Request $request)
    {
        $request->validate([
            'establishment_id' => 'required|exists:etablissements,id',
            'tier' => 'required|in:free,basic,premium,enterprise'
        ]);

        $etablissement = Etablissement::findOrFail($request->establishment_id);
        $etablissement->update([
            'plan_tier' => $request->tier,
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->addMonth(),
        ]);

        // Update settings limits
        $etablissement->setSetting('max_branches', match($request->tier) {
            'free' => 1,
            'basic' => 1,
            'premium' => 5,
            'enterprise' => 999,
            default => 1,
        });

        $etablissement->setSetting('max_students', match($request->tier) {
            'free' => 50,
            'basic' => 200,
            'premium' => 1000,
            'enterprise' => 99999,
            default => 50,
        });

        return response()->json([
            'message' => 'Subscription upgraded successfully via Mock Checkout!',
            'etablissement' => $etablissement
        ]);
    }

    /**
     * Developer helper to simulate Stripe subscription webhook events.
     */
    public function simulateWebhook(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'establishment_id' => 'required|exists:etablissements,id',
            'tier' => 'required|string',
            'status' => 'required|string',
        ]);

        $etablissement = Etablissement::findOrFail($request->establishment_id);
        $payload = [
            'type' => $request->type,
            'data' => [
                'object' => [
                    'id' => 'sub_mock_' . uniqid(),
                    'customer' => $etablissement->stripe_customer_id ?: 'cus_mock_' . uniqid(),
                    'status' => $request->status,
                    'metadata' => [
                        'establishment_id' => $etablissement->id,
                        'plan_tier' => $request->tier,
                    ],
                ]
            ]
        ];

        $this->subscriptionService->handleWebhook($payload);

        return response()->json(['message' => 'Stripe webhook event simulated successfully.']);
    }
}
