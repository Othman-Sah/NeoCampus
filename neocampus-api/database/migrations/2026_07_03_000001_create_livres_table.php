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
        Schema::create('livres', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 255);
            $table->string('auteur', 255);
            $table->string('isbn', 13);
            $table->string('genre', 100)->nullable();
            $table->unsignedInteger('quantite_stock')->default(1);
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['isbn', 'etablissement_id']);
            $table->index('etablissement_id');
            $table->index('genre');
            
            // Fulltext search index
            $table->fullText(['titre', 'auteur']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livres');
    }
};
