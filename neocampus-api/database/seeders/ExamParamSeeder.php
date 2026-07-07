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
use App\Models\Note;
use App\Models\Dispense;
use App\Models\Eleve;
use App\Models\ChargeHoraire;
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
                'periode_saisie_notes_fin' => '2026-07-25 23:59:59', // Active currently
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
        // Since we fresh migrated, let's find the first class and MATH subject
        $classe = Classe::first();
        $matiereMath = Matiere::where('code', 'MATH')->first();

        if ($classe && $matiereMath) {
            // Ensure ChargeHoraire for Math exists
            ChargeHoraire::firstOrCreate([
                'enseignant_id' => $teacher->id,
                'matiere_id' => $matiereMath->id,
                'classe_id' => $classe->id,
            ]);

            // Seed Examen 1: Completed Control (already graded)
            $exam1 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => '2026-06-10 10:00:00',
                'intitule' => 'Contrôle Math 1',
                'classe_id' => $classe->id,
                'matiere_id' => $matiereMath->id,
                'status' => 'completed',
                'periode' => 'Trimestre 1',
                'fichier_sujet' => 'subjects/exam1_sujet.pdf',
            ]);

            // Seed Examen 2: Approved, needs upload (fichier_sujet is null)
            $exam2 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => '2026-06-20 14:00:00',
                'intitule' => 'Contrôle Math 2',
                'classe_id' => $classe->id,
                'matiere_id' => $matiereMath->id,
                'status' => 'approved',
                'periode' => 'Trimestre 1',
                'fichier_sujet' => null,
            ]);

            // Seed Examen 3: Draft (to propose schedule)
            $exam3 = Examen::create([
                'etablissement_id' => $etablissement->id,
                'date' => null,
                'intitule' => 'Examen Final Math',
                'classe_id' => $classe->id,
                'matiere_id' => $matiereMath->id,
                'status' => 'draft',
                'periode' => 'Trimestre 1',
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

            // Seed a second subject (Français) for the same class and teacher to demonstrate coefficients
            $matiereFrancais = Matiere::where('code', 'FRAN')->first();
            if ($matiereFrancais) {
                // Ensure ChargeHoraire for French exists
                ChargeHoraire::firstOrCreate([
                    'enseignant_id' => $teacher->id,
                    'matiere_id' => $matiereFrancais->id,
                    'classe_id' => $classe->id,
                ]);

                // Create Francais Exam (completed and graded)
                $examFrancais = Examen::create([
                    'etablissement_id' => $etablissement->id,
                    'date' => '2026-06-12 11:00:00',
                    'intitule' => 'Contrôle Français 1',
                    'classe_id' => $classe->id,
                    'matiere_id' => $matiereFrancais->id,
                    'status' => 'completed',
                    'periode' => 'Trimestre 1',
                    'fichier_sujet' => 'subjects/exam_francais_sujet.pdf',
                ]);
            }

            // Seed student grades (notes) for Math (exam1) and Français (examFrancais)
            $students = Eleve::where('classe_id', $classe->id)->get();
            $index = 0;

            foreach ($students as $student) {
                // Student 1 (index 0) is exempt from Mathematics to test PE-style exemption logic
                if ($index === 0) {
                    Dispense::create([
                        'etablissement_id' => $etablissement->id,
                        'eleve_id' => $student->id,
                        'matiere_id' => $matiereMath->id,
                    ]);
                } else {
                    // Standard Math grade
                    Note::create([
                        'etablissement_id' => $etablissement->id,
                        'examen_id' => $exam1->id,
                        'eleve_id' => $student->id,
                        'valeur' => 10 + ($index % 11), // grades between 10 and 20
                        'absent_justifie' => false,
                    ]);
                }

                // Student 2 (index 1) is absent with justification for French exam
                if ($index === 1 && isset($examFrancais)) {
                    Note::create([
                        'etablissement_id' => $etablissement->id,
                        'examen_id' => $examFrancais->id,
                        'eleve_id' => $student->id,
                        'valeur' => null,
                        'absent_justifie' => true,
                    ]);
                } elseif (isset($examFrancais)) {
                    // Standard French grade
                    Note::create([
                        'etablissement_id' => $etablissement->id,
                        'examen_id' => $examFrancais->id,
                        'eleve_id' => $student->id,
                        'valeur' => 12 + ($index % 9), // grades between 12 and 20
                        'absent_justifie' => false,
                    ]);
                }

                $index++;
            }

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
