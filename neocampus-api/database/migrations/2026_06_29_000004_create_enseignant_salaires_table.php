<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignant_salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->string('mois'); // e.g. "2026-06"
            $table->decimal('salaire_de_base', 10, 2)->default(0.00);
            $table->decimal('primes', 10, 2)->default(0.00);
            $table->decimal('indemnites', 10, 2)->default(0.00);
            $table->decimal('retenues', 10, 2)->default(0.00);
            $table->decimal('salaire_net', 10, 2)->default(0.00);
            $table->string('statut')->default('Draft'); // Draft, Paid
            $table->date('date_paiement')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['etablissement_id', 'enseignant_id', 'mois']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignant_salaires');
    }
};
