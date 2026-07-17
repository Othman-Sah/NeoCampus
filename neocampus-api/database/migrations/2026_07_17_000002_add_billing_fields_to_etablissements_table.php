<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {
            $table->enum('plan_tier', ['free', 'basic', 'premium', 'enterprise'])->default('free');
            $table->string('subscription_status')->default('trialing');
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_subscription_id')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {
            $table->dropColumn([
                'plan_tier',
                'subscription_status',
                'stripe_customer_id',
                'stripe_subscription_id',
                'trial_ends_at',
                'subscription_ends_at'
            ]);
        });
    }
};
