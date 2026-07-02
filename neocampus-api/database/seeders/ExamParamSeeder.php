<?php

namespace Database\Seeders;

use App\Models\ParametresExamen;
use App\Models\Examen;
use App\Models\Matiere;
use App\Models\Classe;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\User;
use App\Models\DemandePlannificationExamen;
use App\Models\DemandeExceptionNote;
use Illuminate\Database\Seeder;

class ExamParamSeeder extends Seeder
{
    public function run(): void
    {
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        // 1. Create default exam parameters
        ParametresExamen::updateOrCreate(
            ['etablissement_id' => $etablissement->id],
            [
                'periode_saisie_notes_debut' => '2026-06-01 00:00:00',
                'periode_saisie_notes_fin' => '2026-07-15 23:59:59', // Active currently
                'force_admin_schedule' => false,
                'require_sujet_upload' => true,
                'template_sujet_path' => 'templates/exam_template_emsi.docx',
            ]
        );

        // Find the math teacher (first seeded teacher)
        $teacherUser = User::where('email', 'enseignant@neocampus.com')->first();
        if (!$teacherUser) {
            return;
        }
        $teacher = Enseignant::where('user_id', $teacherUser->id)->first();
        if (!$teacher) {
            return;
        }

        // Find teacher's classes and subjects
        $classe = $teacher->classes()->first();
        $matiere = $teacher->matieres()->first();

        if ($classe && $matiere) {
            // Seed Examen 1: Completed Control (already graded)
            $exam1 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => '2026-06-10 10:00:00',
                'intitule' => 'Contrôle 1',
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
                'status' => 'completed',
                'fichier_sujet' => 'subjects/exam1_sujet.pdf',
            ]);

            // Seed Examen 2: Approved, needs upload (fichier_sujet is null)
            $exam2 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => '2026-06-20 14:00:00',
                'intitule' => 'Contrôle 2',
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
                'status' => 'approved',
                'fichier_sujet' => null, // This triggers the red square alert
            ]);

            // Seed Examen 3: Draft (to propose schedule)
            $exam3 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => null,
                'intitule' => 'Examen Final',
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
                'status' => 'draft',
                'fichier_sujet' => null,
            ]);

            // Seed schedule proposals
            DemandePlannificationExamen::create([
                'enseignant_id' => $teacher->id,
                'examen_id' => $exam3->id,
                'date_proposee' => '2026-07-10 09:00:00',
                'statut' => 'pending',
                'commentaire_admin' => null,
                'etablissement_id' => $etablissement->id,
            ]);

            // Let's create another draft exam to show a rejected schedule proposal with comment
            $exam4 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => null,
                'intitule' => 'Rattrapage Math',
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
                'status' => 'draft',
                'fichier_sujet' => null,
            ]);

            DemandePlannificationExamen::create([
                'enseignant_id' => $teacher->id,
                'examen_id' => $exam4->id,
                'date_proposee' => '2026-07-12 15:00:00',
                'statut' => 'rejected',
                'commentaire_admin' => 'Cette plage horaire entre en conflit avec une autre épreuve.',
                'etablissement_id' => $etablissement->id,
            ]);

            // Let's create an approved proposal to test
            $exam5 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => '2026-07-08 08:30:00',
                'intitule' => 'Contrôle 3',
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
                'status' => 'approved',
                'fichier_sujet' => null,
            ]);

            DemandePlannificationExamen::create([
                'enseignant_id' => $teacher->id,
                'examen_id' => $exam5->id,
                'date_proposee' => '2026-07-08 08:30:00',
                'statut' => 'approved',
                'commentaire_admin' => 'Planification validée.',
                'etablissement_id' => $etablissement->id,
            ]);

            // Seed a Demande Exception Note
            DemandeExceptionNote::create([
                'enseignant_id' => $teacher->id,
                'examen_id' => $exam1->id,
                'motif' => "Saisie tardive suite à l'absence prolongée de plusieurs élèves.",
                'statut' => 'pending',
                'admin_id' => null,
                'etablissement_id' => $etablissement->id,
            ]);
        }
    }
}
