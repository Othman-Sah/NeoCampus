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
        // 1. Create type_evaluations table
        if (!Schema::hasTable('type_evaluations')) {
            Schema::create('type_evaluations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
                $table->string('nom');
                $table->string('code');
                $table->float('poids_defaut')->default(1.0);
                $table->timestamps();
            });
        }

        // 2. Create coefficient_classe_matiere table
        if (!Schema::hasTable('coefficient_classe_matiere')) {
            Schema::create('coefficient_classe_matiere', function (Blueprint $table) {
                $table->id();
                $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
                $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
                $table->float('coefficient')->default(1.0);
                $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['classe_id', 'matiere_id', 'etablissement_id'], 'coef_class_mat_etab_unique');
            });
        }

        // 3. Create groupe_matieres table
        if (!Schema::hasTable('groupe_matieres')) {
            Schema::create('groupe_matieres', function (Blueprint $table) {
                $table->id();
                $table->string('nom');
                $table->integer('ordre')->default(0);
                $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
                $table->timestamps();
            });
        }

        // 4. Create bulletin_configs table
        if (!Schema::hasTable('bulletin_configs')) {
            Schema::create('bulletin_configs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
                $table->string('niveau')->nullable();
                $table->string('format_periode')->default('trimestre');
                $table->float('seuil_encouragements')->default(12.0);
                $table->float('seuil_tableau_honneur')->default(14.0);
                $table->float('seuil_felicitations')->default(16.0);
                $table->boolean('show_min_max')->default(true);
                $table->boolean('show_rang_matiere')->default(true);
                $table->boolean('show_detail_notes')->default(false);
                $table->boolean('show_sous_total_groupe')->default(true);
                $table->float('note_eliminatoire')->nullable();
                $table->timestamps();
            });
        }

        // 5. Add columns to examens table
        Schema::table('examens', function (Blueprint $table) {
            if (!Schema::hasColumn('examens', 'type_evaluation_id')) {
                $table->foreignId('type_evaluation_id')->nullable()->constrained('type_evaluations')->onDelete('set null');
            }
            if (!Schema::hasColumn('examens', 'poids')) {
                $table->float('poids')->nullable();
            }
        });

        // 6. Add columns to matieres table
        Schema::table('matieres', function (Blueprint $table) {
            if (!Schema::hasColumn('matieres', 'groupe_matiere_id')) {
                $table->foreignId('groupe_matiere_id')->nullable()->constrained('groupe_matieres')->onDelete('set null');
            }
            if (!Schema::hasColumn('matieres', 'ordre_dans_groupe')) {
                $table->integer('ordre_dans_groupe')->default(0);
            }
        });

        // 7. Add columns to bulletins table
        Schema::table('bulletins', function (Blueprint $table) {
            if (!Schema::hasColumn('bulletins', 'decision_conseil')) {
                $table->string('decision_conseil')->nullable();
            }
            if (!Schema::hasColumn('bulletins', 'mention')) {
                $table->string('mention')->nullable();
            }
            if (!Schema::hasColumn('bulletins', 'validated_by')) {
                $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('bulletins', 'validated_at')) {
                $table->dateTime('validated_at')->nullable();
            }
            if (!Schema::hasColumn('bulletins', 'published_at')) {
                $table->dateTime('published_at')->nullable();
            }
            if (!Schema::hasColumn('bulletins', 'absences_justifiees')) {
                $table->integer('absences_justifiees')->default(0);
            }
            if (!Schema::hasColumn('bulletins', 'absences_injustifiees')) {
                $table->integer('absences_injustifiees')->default(0);
            }
            if (!Schema::hasColumn('bulletins', 'retards')) {
                $table->integer('retards')->default(0);
            }
        });

        // 8. Add columns to bulletin_details table
        Schema::table('bulletin_details', function (Blueprint $table) {
            if (!Schema::hasColumn('bulletin_details', 'notes_detail')) {
                $table->json('notes_detail')->nullable();
            }
            if (!Schema::hasColumn('bulletin_details', 'sous_total_pondere')) {
                $table->float('sous_total_pondere')->nullable();
            }
        });

        // 9. Add column to presences table
        Schema::table('presences', function (Blueprint $table) {
            if (!Schema::hasColumn('presences', 'justifie')) {
                $table->boolean('justifie')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->dropColumn('justifie');
        });

        Schema::table('bulletin_details', function (Blueprint $table) {
            $table->dropColumn(['notes_detail', 'sous_total_pondere']);
        });

        Schema::table('bulletins', function (Blueprint $table) {
            $table->dropColumn([
                'decision_conseil', 'mention', 'validated_by', 'validated_at',
                'published_at', 'absences_justifiees', 'absences_injustifiees', 'retards'
            ]);
        });

        Schema::table('matieres', function (Blueprint $table) {
            $table->dropForeign(['groupe_matiere_id']);
            $table->dropColumn(['groupe_matiere_id', 'ordre_dans_groupe']);
        });

        Schema::table('examens', function (Blueprint $table) {
            $table->dropForeign(['type_evaluation_id']);
            $table->dropColumn(['type_evaluation_id', 'poids']);
        });

        Schema::dropIfExists('bulletin_configs');
        Schema::dropIfExists('groupe_matieres');
        Schema::dropIfExists('coefficient_classe_matiere');
        Schema::dropIfExists('type_evaluations');
    }
};
