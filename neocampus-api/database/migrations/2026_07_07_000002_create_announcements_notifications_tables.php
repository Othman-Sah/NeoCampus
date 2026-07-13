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
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->string('titre', 255);
            $table->text('contenu');
            $table->string('extrait', 500)->nullable();
            $table->json('target_roles')->comment('["admin","enseignant","parent","eleve","chauffeur"]');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['etablissement_id', 'published_at'], 'idx_annonces_published');
            $table->index(['etablissement_id', 'published_at', 'is_pinned'], 'idx_annonces_target');
            $table->index('user_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->foreignId('target_user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->string('type', 50)->comment('annonce, transport, note, presence, paiement, systeme');
            $table->string('titre', 255);
            $table->text('contenu');
            $table->string('link', 255)->nullable()->comment('Frontend route to navigate to');
            $table->boolean('is_read')->default(false);
            $table->timestamp('date_envoi')->useCurrent();
            $table->timestamps();

            $table->index(['target_user_id', 'is_read', 'date_envoi'], 'idx_notifications_user');
            $table->index(['etablissement_id', 'target_user_id'], 'idx_notifications_tenant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('annonces');
    }
};
