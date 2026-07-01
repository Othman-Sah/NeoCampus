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
        Schema::create('eleves', function (Blueprint $table) {
            $table->id();
            // Tenant Isolation
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            
            // Login Link
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // Student Core Metadata
            $table->string('matricule')->index();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->nullable();
            $table->string('sexe')->nullable();
            $table->date('date_naissance')->nullable();
            $table->foreignId('classe_id')->nullable()->constrained('classes')->onDelete('set null');
            $table->string('classe_nom')->nullable();
            $table->string('status')->default('Actif');
            
            // Parent & Dossier information in unified table
            $table->json('parent_contact')->nullable();
            $table->json('documents')->nullable();
            $table->text('scolarite_anterieure')->nullable();
            
            $table->timestamps();

            // Unique index per tenant for matricule
            $table->unique(['etablissement_id', 'matricule']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};
