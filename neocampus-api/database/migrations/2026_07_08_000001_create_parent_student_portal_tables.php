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
        // 1. parent_eleve
        Schema::create('parent_eleve', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->foreignId('eleve_id')
                ->constrained('eleves')
                ->onDelete('cascade');
            $table->string('relation', 50)->nullable()->comment('Father, Mother, Guardian, etc.');
            $table->timestamps();

            $table->unique(['parent_user_id', 'eleve_id'], 'unique_parent_child');
        });

        // 2. supports (course materials)
        Schema::create('supports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->foreignId('enseignant_id')
                ->constrained('enseignants')
                ->onDelete('cascade');
            $table->foreignId('classe_id')
                ->constrained('classes')
                ->onDelete('cascade');
            $table->foreignId('matiere_id')
                ->constrained('matieres')
                ->onDelete('cascade');
            $table->string('titre', 255);
            $table->text('description')->nullable();
            $table->string('fichier_url', 500)->nullable()->comment('URL or path to uploaded file');
            $table->enum('type', ['document', 'video', 'link', 'image'])->default('document');
            $table->timestamps();

            $table->index(['classe_id', 'matiere_id'], 'idx_supports_class');
        });

        // 3. devoirs (homework)
        Schema::create('devoirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->foreignId('enseignant_id')
                ->constrained('enseignants')
                ->onDelete('cascade');
            $table->foreignId('classe_id')
                ->constrained('classes')
                ->onDelete('cascade');
            $table->foreignId('matiere_id')
                ->constrained('matieres')
                ->onDelete('cascade');
            $table->string('titre', 255);
            $table->text('description')->nullable();
            $table->date('date_echeance');
            $table->string('fichier_url', 500)->nullable()->comment('Optional attachment');
            $table->timestamps();

            $table->index(['classe_id', 'date_echeance'], 'idx_devoirs_class_due');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devoirs');
        Schema::dropIfExists('supports');
        Schema::dropIfExists('parent_eleve');
    }
};
