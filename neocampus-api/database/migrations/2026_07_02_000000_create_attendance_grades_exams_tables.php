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
        // 1. Parametres Examens
        Schema::create('parametres_examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->dateTime('periode_saisie_notes_debut');
            $table->dateTime('periode_saisie_notes_fin');
            $table->boolean('force_admin_schedule')->default(false);
            $table->string('template_sujet_path')->nullable();
            $table->boolean('require_sujet_upload')->default(false);
            $table->timestamps();

            $table->index('etablissement_id', 'param_exam_etab_idx');
        });

        // 2. Examens
        Schema::create('examens', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date')->nullable(); // Proposes or sets a date
            $table->string('intitule');
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'rejected', 'completed'])->default('draft');
            $table->string('fichier_sujet')->nullable();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'classe_id'], 'exam_etab_classe_idx');
            $table->index('matiere_id', 'exam_matiere_idx');
        });

        // 3. Presences
        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seance_id')->constrained('seances')->onDelete('cascade');
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->enum('statut', ['present', 'absent', 'retard']);
            $table->text('motif')->nullable();
            $table->date('date');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'seance_id', 'date'], 'pres_etab_seance_date_idx');
            $table->index('eleve_id', 'pres_eleve_idx');
        });

        // 4. Notes
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->float('valeur', 4, 2); // 0 to 20 float, e.g. 18.75
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'examen_id'], 'notes_etab_exam_idx');
            $table->index('eleve_id', 'notes_eleve_idx');
            $table->unique(['examen_id', 'eleve_id'], 'notes_exam_eleve_unique'); // Unique grade per exam/student
        });

        // 5. Bulletins
        Schema::create('bulletins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->string('periode'); // e.g. 'Trimestre 1'
            $table->float('moyenne_generale', 4, 2);
            $table->date('date_generation');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'eleve_id'], 'bull_etab_eleve_idx');
            $table->unique(['eleve_id', 'periode'], 'bull_eleve_periode_unique');
        });

        // 6. Demandes Exceptions Notes
        Schema::create('demandes_exceptions_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->text('motif');
            $table->enum('statut', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'enseignant_id'], 'den_etab_ens_idx');
            $table->index('examen_id', 'den_exam_idx');
        });

        // 7. Demandes Plannification Examens
        Schema::create('demandes_plannification_examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->dateTime('date_proposee');
            $table->enum('statut', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('commentaire_admin')->nullable();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index(['etablissement_id', 'enseignant_id'], 'dpe_etab_ens_idx');
            $table->index('examen_id', 'dpe_exam_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_plannification_examens');
        Schema::dropIfExists('demandes_exceptions_notes');
        Schema::dropIfExists('bulletins');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('presences');
        Schema::dropIfExists('examens');
        Schema::dropIfExists('parametres_examens');
    }
};
