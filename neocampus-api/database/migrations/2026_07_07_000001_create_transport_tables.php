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
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->string('matricule', 20);
            $table->string('marque', 100);
            $table->string('modele', 100)->nullable();
            $table->unsignedInteger('capacite');
            $table->enum('statut', ['actif', 'maintenance', 'hors_service'])->default('actif');
            $table->unsignedInteger('annee_mise_en_service')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['etablissement_id', 'matricule'], 'unique_matricule_per_tenant');
            $table->index('etablissement_id');
        });

        Schema::create('chauffeurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('telephone', 20)->nullable();
            $table->string('num_permis', 50);
            $table->foreignId('vehicule_id')
                ->nullable()
                ->constrained('vehicules')
                ->nullOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['etablissement_id', 'num_permis'], 'unique_permis_per_tenant');
            $table->index('etablissement_id');
            $table->index('vehicule_id');
            $table->index('user_id');
        });

        Schema::create('itineraires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->string('nom', 150);
            $table->string('zone', 150);
            $table->text('description')->nullable();
            $table->foreignId('vehicule_id')
                ->nullable()
                ->constrained('vehicules')
                ->nullOnDelete();
            $table->time('heure_depart')->nullable();
            $table->time('heure_retour')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
            $table->softDeletes();

            $table->index('etablissement_id');
            $table->index('vehicule_id');
        });

        Schema::create('eleve_itineraire', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')
                ->constrained('eleves')
                ->onDelete('cascade');
            $table->foreignId('itineraire_id')
                ->constrained('itineraires')
                ->onDelete('cascade');
            $table->string('point_ramassage', 200)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->unique(['eleve_id', 'itineraire_id'], 'unique_student_route');
            $table->index('eleve_id');
            $table->index('itineraire_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleve_itineraire');
        Schema::dropIfExists('itineraires');
        Schema::dropIfExists('chauffeurs');
        Schema::dropIfExists('vehicules');
    }
};
