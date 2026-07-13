<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Seance;
use App\Models\Presence;
use App\Models\Examen;
use App\Models\Note;
use App\Models\TypeEvaluation;
use App\Models\Frais;
use App\Models\Paiement;
use App\Models\TypeFrais;
use App\Models\GroupeFrais;
use App\Models\User;
use App\Models\Solde;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AdminDashboardStatsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        $comptable = User::where('etablissement_id', $etablissement->id)
            ->where('role', 'comptable')
            ->first();
        $comptableId = $comptable ? $comptable->id : null;

        $students = Eleve::where('etablissement_id', $etablissement->id)->get();
        $classes = Classe::where('etablissement_id', $etablissement->id)->get();
        $matieres = Matiere::where('etablissement_id', $etablissement->id)->get();
        $seances = Seance::where('etablissement_id', $etablissement->id)->get();
        $typeEval = TypeEvaluation::where('etablissement_id', $etablissement->id)->first();

        if ($students->isEmpty() || $classes->isEmpty() || $matieres->isEmpty()) {
            return;
        }

        // 1. Seed historical Presence records for the past 30 days
        $dayOfWeekMap = [
            1 => 'Lundi',
            2 => 'Mardi',
            3 => 'Mercredi',
            4 => 'Jeudi',
            5 => 'Vendredi',
            6 => 'Samedi',
            7 => 'Dimanche'
        ];

        // Seed daily presence for the past 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayOfWeekNum = $date->dayOfWeek; // 1 (Mon) - 7 (Sun)
            
            // Skip weekends
            if ($dayOfWeekNum === 6 || $dayOfWeekNum === 7) {
                continue;
            }

            $jourName = $dayOfWeekMap[$dayOfWeekNum] ?? null;
            if (!$jourName) {
                continue;
            }

            // Find seances scheduled for this day of the week
            $daySeances = $seances->where('jour', $jourName);
            if ($daySeances->isEmpty()) {
                // If no seances were seeded, pick first 3 seances and assign them to this day temporarily
                $daySeances = $seances->take(3);
            }

            foreach ($daySeances as $seance) {
                $classStudents = $students->where('classe_id', $seance->classe_id);
                foreach ($classStudents as $student) {
                    // 93% present, 4% retard, 3% absent
                    $rand = rand(1, 100);
                    if ($rand <= 93) {
                        $statut = 'present';
                    } elseif ($rand <= 97) {
                        $statut = 'retard';
                    } else {
                        $statut = 'absent';
                    }

                    // Check if already exists to avoid duplicate entries
                    Presence::updateOrCreate(
                        [
                            'seance_id' => $seance->id,
                            'eleve_id' => $student->id,
                            'date' => $date->toDateString(),
                        ],
                        [
                            'etablissement_id' => $etablissement->id,
                            'statut' => $statut,
                            'motif' => $statut === 'absent' ? 'Raison familiale / Maladie' : null,
                            'justifie' => $statut === 'absent' ? (rand(1, 100) <= 50) : false,
                        ]
                    );
                }
            }
        }

        // 2. Seed exam grades (Note and Examen) across multiple classes and subjects
        foreach ($classes as $classe) {
            // Pick 3 matieres per class for seeding exams
            $classMatieres = $matieres->take(3);

            foreach ($classMatieres as $matiere) {
                // Create an exam scheduled 10 days ago
                $examDate = Carbon::today()->subDays(10);
                $examen = Examen::updateOrCreate(
                    [
                        'etablissement_id' => $etablissement->id,
                        'classe_id' => $classe->id,
                        'matiere_id' => $matiere->id,
                        'intitule' => 'Contrôle Continu 1 - ' . $matiere->nom,
                    ],
                    [
                        'date' => $examDate,
                        'status' => 'valide',
                        'type_evaluation_id' => $typeEval ? $typeEval->id : 1,
                        'poids' => 1.0,
                    ]
                );

                // Create a future exam scheduled in 5 days
                $futureExamDate = Carbon::today()->addDays(5)->setHour(9)->setMinute(0)->setSecond(0);
                Examen::updateOrCreate(
                    [
                        'etablissement_id' => $etablissement->id,
                        'classe_id' => $classe->id,
                        'matiere_id' => $matiere->id,
                        'intitule' => 'Contrôle Continu 2 - ' . $matiere->nom,
                    ],
                    [
                        'date' => $futureExamDate,
                        'status' => 'propose',
                        'type_evaluation_id' => $typeEval ? $typeEval->id : 1,
                        'poids' => 1.0,
                    ]
                );

                // Add notes for the past exam for each student in the class
                $classStudents = $students->where('classe_id', $classe->id);
                foreach ($classStudents as $student) {
                    // Grade value between 6.0 and 20.0 (mostly 12.0 to 18.0)
                    $valeur = rand(60, 200) / 10.0;
                    Note::updateOrCreate(
                        [
                            'etablissement_id' => $etablissement->id,
                            'examen_id' => $examen->id,
                            'eleve_id' => $student->id,
                        ],
                        [
                            'valeur' => $valeur,
                            'absent_justifie' => false,
                        ]
                    );
                }
            }
        }

        // 3. Seed student payment logs (Paiement and Frais) to build the revenue vs. outstanding trend
        // Retrieve or create a Fee category and TypeFrais
        $groupeFrais = GroupeFrais::where('etablissement_id', $etablissement->id)->first();
        if (!$groupeFrais) {
            $groupeFrais = GroupeFrais::create([
                'etablissement_id' => $etablissement->id,
                'nom' => 'Frais Scolaires',
                'description' => 'Frais de scolarité mensuels.',
            ]);
        }

        // Clean out duplicate seeded logs to show clean historical trends for the past 6 months
        // Let's seed for the past 6 months (February to July 2026)
        for ($monthOffset = 5; $monthOffset >= 0; $monthOffset--) {
            $monthDate = Carbon::now()->subMonths($monthOffset);
            $year = $monthDate->year;
            $month = $monthDate->month;

            $typeFrais = TypeFrais::updateOrCreate(
                [
                    'etablissement_id' => $etablissement->id,
                    'libelle' => 'Mensualité ' . $monthDate->translatedFormat('F') . ' ' . $year,
                ],
                [
                    'groupe_frais_id' => $groupeFrais->id,
                    'montant_par_defaut' => 2000.00,
                ]
            );

            // Seed fees for a subset of 15 students to avoid massive DB bloat
            $sampleStudents = $students->take(15);
            $index = 0;
            foreach ($sampleStudents as $student) {
                // Determine payment status:
                // If it is the current month: some paid, some unpaid
                // If it is a past month: 85% paid, 15% late
                if ($monthOffset === 0) {
                    $statut = ($index % 3 === 0) ? 'en_attente' : 'paye';
                } else {
                    $statut = ($index % 8 === 0) ? 'en_retard' : 'paye';
                }

                $dueDate = Carbon::create($year, $month, 10)->toDateString();

                $fee = Frais::updateOrCreate(
                    [
                        'etablissement_id' => $etablissement->id,
                        'type_frais_id' => $typeFrais->id,
                        'eleve_id' => $student->id,
                    ],
                    [
                        'montant' => 2000.00,
                        'date_echeance' => $dueDate,
                        'statut' => $statut,
                        'annee_scolaire' => '2025-2026',
                    ]
                );

                if ($statut === 'paye') {
                    $payDate = Carbon::create($year, $month, rand(1, 9))->toDateString();
                    Paiement::updateOrCreate(
                        [
                            'etablissement_id' => $etablissement->id,
                            'frais_id' => $fee->id,
                        ],
                        [
                            'montant_paye' => 2000.00,
                            'date_paiement' => $payDate,
                            'mode' => ['cash', 'virement', 'cheque'][rand(0, 2)],
                            'reference' => 'PAY-' . $year . $month . '-' . str_pad($student->id, 3, '0', STR_PAD_LEFT),
                            'comptable_id' => $comptableId,
                        ]
                    );
                }

                $index++;
            }
        }

        // Recalculate student soldes for sample students to keep Solde table consistent
        foreach ($students as $student) {
            $studentFees = Frais::with('paiements')->where('eleve_id', $student->id)->get();
            $totalDue = 0.0;
            $totalPaid = 0.0;
            foreach ($studentFees as $sf) {
                $totalDue += (float) $sf->montant;
                foreach ($sf->paiements as $p) {
                    $totalPaid += (float) $p->montant_paye;
                }
            }

            Solde::updateOrCreate(
                [
                    'etablissement_id' => $etablissement->id,
                    'eleve_id' => $student->id,
                ],
                [
                    'montant_du' => $totalDue,
                    'montant_paye' => $totalPaid,
                ]
            );
        }
    }
}
