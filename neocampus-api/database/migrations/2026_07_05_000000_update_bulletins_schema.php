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
        // Add logo column to etablissements table
        Schema::table('etablissements', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('nom');
        });

        // 1. Drop existing bulletins table if it exists
        Schema::dropIfExists('bulletins');

        // 2. Re-create bulletins table with UUID and detailed metrics
        Schema::create('bulletins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->string('annee_scolaire'); // e.g. "2025/2026"
            $table->string('periode'); // e.g. "Trimestre 1"
            $table->decimal('moyenne_generale', 4, 2)->nullable();
            $table->decimal('moyenne_classe', 4, 2)->nullable();
            $table->integer('rang_classe')->nullable();
            $table->integer('total_absences')->default(0);
            $table->text('appreciation_generale')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT, PUBLISHED
            $table->timestamps();

            $table->index(['etablissement_id', 'classe_id'], 'bull_etab_classe_idx');
            $table->index('eleve_id', 'bull_eleve_idx');
            $table->unique(['eleve_id', 'periode', 'annee_scolaire'], 'bull_eleve_period_unique');
        });

        // 3. Create bulletin_details table for line items
        Schema::create('bulletin_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bulletin_id')->constrained('bulletins')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('prof_id')->constrained('enseignants')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->decimal('coefficient', 4, 2)->default(1.00);
            $table->decimal('moyenne_eleve', 4, 2)->nullable();
            $table->decimal('moyenne_min', 4, 2)->nullable();
            $table->decimal('moyenne_max', 4, 2)->nullable();
            $table->decimal('moyenne_classe_matiere', 4, 2)->nullable();
            $table->integer('rang_matiere')->nullable();
            $table->text('appreciation_prof')->nullable();
            $table->timestamps();

            $table->index('bulletin_id', 'det_bull_idx');
            $table->index('etablissement_id', 'det_etab_idx');
            $table->unique(['bulletin_id', 'matiere_id'], 'det_bull_matiere_unique');
        });

        // 4. Create dispenses table for subject exemptions
        Schema::create('dispenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['eleve_id', 'matiere_id'], 'disp_eleve_matiere_unique');
        });

        // 5. Update matieres table to add coefficient
        Schema::table('matieres', function (Blueprint $table) {
            $table->decimal('coefficient', 4, 2)->default(1.00)->after('code');
        });

        // 6. Update examens table to add period
        Schema::table('examens', function (Blueprint $table) {
            $table->string('periode')->nullable()->after('status'); // e.g. "Trimestre 1"
        });

        // 7. Update notes table to make valeur nullable and add absent_justifie
        Schema::table('notes', function (Blueprint $table) {
            $table->float('valeur', 4, 2)->nullable()->change();
            $table->boolean('absent_justifie')->default(false)->after('valeur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->float('valeur', 4, 2)->nullable(false)->change();
            $table->dropColumn('absent_justifie');
        });

        Schema::table('examens', function (Blueprint $table) {
            $table->dropColumn('periode');
        });

        Schema::table('matieres', function (Blueprint $table) {
            $table->dropColumn('coefficient');
        });

        Schema::table('etablissements', function (Blueprint $table) {
            $table->dropColumn('logo');
        });

        Schema::dropIfExists('dispenses');
        Schema::dropIfExists('bulletin_details');
        Schema::dropIfExists('bulletins');

        // Recreate simple bulletins table
        Schema::create('bulletins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->string('periode');
            $table->float('moyenne_generale', 4, 2);
            $table->date('date_generation');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
