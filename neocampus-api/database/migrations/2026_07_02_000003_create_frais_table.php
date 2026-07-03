<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('frais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_frais_id')->constrained('type_frais')->onDelete('cascade');
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->date('date_echeance');
            $table->enum('statut', ['en_attente', 'paye', 'en_retard'])->default('en_attente');
            $table->string('annee_scolaire', 9)->nullable();
            $table->timestamps();

            $table->index('eleve_id');
            $table->index('etablissement_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frais');
    }
};
