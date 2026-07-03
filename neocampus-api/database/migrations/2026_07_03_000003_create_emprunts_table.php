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
        Schema::create('emprunts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livre_id')
                ->constrained('livres')
                ->onDelete('cascade');
            $table->foreignId('adherent_id')
                ->constrained('adherents')
                ->onDelete('cascade');
            $table->date('date_emprunt');
            $table->date('date_retour_prevue');
            $table->date('date_retour_effective')->nullable();
            $table->enum('statut', ['en_cours', 'rendu', 'en_retard'])->default('en_cours');
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index('etablissement_id');
            $table->index('statut');
            $table->index('livre_id');
            $table->index('adherent_id');
            $table->index('date_retour_prevue');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emprunts');
    }
};
