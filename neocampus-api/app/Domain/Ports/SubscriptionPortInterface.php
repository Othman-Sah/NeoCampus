<?php

namespace App\Domain\Ports;

use App\Models\Etablissement;

interface SubscriptionPortInterface
{
    /**
     * Create a Stripe Checkout Session for a plan upgrade/downgrade.
     *
     * @param Etablissement $etablissement
     * @param string $planTier
     * @return string
     */
    public function createCheckoutSession(Etablissement $etablissement, string $planTier): string;

    /**
     * Create a Stripe Customer Portal Session for managing cards/invoices.
     *
     * @param Etablissement $etablissement
     * @return string
     */
    public function createPortalSession(Etablissement $etablissement): string;

    /**
     * Handle Stripe Webhook event.
     *
     * @param array $payload
     * @return void
     */
    public function handleWebhook(array $payload): void;
}
