<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('specialite');
            $table->decimal('salaire_de_base', 10, 2)->default(0.00);
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['etablissement_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignants');
    }
};
