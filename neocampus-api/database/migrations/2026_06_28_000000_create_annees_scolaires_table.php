<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annees_scolaires', function (Blueprint $table) {
            $table->id();
            $table->string('libelle'); // e.g. "2025/2026"
            $table->date('date_debut');
            $table->date('date_fin');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['etablissement_id', 'libelle']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annees_scolaires');
    }
};
