<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recettes_depenses', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 200);
            $table->decimal('montant', 10, 2);
            $table->enum('type', ['recette', 'depense']);
            $table->string('categorie', 100)->nullable();
            $table->date('date');
            $table->string('justificatif', 255)->nullable();
            $table->foreignId('saisie_par')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index('etablissement_id');
            $table->index('type');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recettes_depenses');
    }
};
