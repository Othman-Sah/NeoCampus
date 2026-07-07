<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\BulletinPortInterface;
use App\Models\Bulletin;
use App\Models\BulletinDetail;
use App\Models\Dispense;
use App\Models\Eleve;
use App\Models\Examen;
use App\Models\Note;
use App\Models\Presence;
use App\Models\Classe;
use App\Models\ChargeHoraire;
use App\Models\CoefficientClasseMatiere;
use App\Models\BulletinConfig;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EloquentBulletinRepository implements BulletinPortInterface
{
    public function generateBulk(int $classeId, string $periode, string $anneeScolaire): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($classeId, $periode, $anneeScolaire, $tenantId) {
            // 1. Fetch Class and Academic Year details
            $classe = Classe::with('anneeScolaire')
                ->where('id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->firstOrFail();

            // 2. Fetch all students in the class
            $students = Eleve::where('classe_id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->get();

            if ($students->isEmpty()) {
                return [];
            }

            // 3. Look at classe_matiere first, then LEFT JOIN / load charge_horaires to get teachers
            $classMatieres = DB::table('classe_matiere')
                ->where('classe_id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->pluck('matiere_id');

            if ($classMatieres->isEmpty()) {
                return [];
            }

            // Build a merged collection: subject + optional teacher
            $charges = collect();
            foreach ($classMatieres as $matiereId) {
                $matiere = \App\Models\Matiere::find($matiereId);
                if (!$matiere) continue;
                
                $charge = ChargeHoraire::with('enseignant')
                    ->where('classe_id', $classeId)
                    ->where('matiere_id', $matiereId)
                    ->first();
                
                $charges->push((object)[
                    'matiere_id' => $matiereId,
                    'matiere' => $matiere,
                    'enseignant_id' => $charge?->enseignant_id,
                    'enseignant' => $charge?->enseignant,
                ]);
            }

            // 4. Fetch completed exams for the class in this period, eager load type evaluation
            $exams = Examen::with('typeEvaluation')
                ->where('classe_id', $classeId)
                ->where('status', 'completed')
                ->where('periode', $periode)
                ->where('etablissement_id', $tenantId)
                ->get();

            $examIds = $exams->pluck('id')->toArray();

            // 5. Eager-load all grades (notes) for the class exams in a single query
            $allNotes = Note::whereIn('examen_id', $examIds)
                ->where('etablissement_id', $tenantId)
                ->get()
                ->groupBy('eleve_id');

            // 6. Eager-load all exemptions (dispenses) for the students in this class
            $allDispenses = Dispense::whereIn('eleve_id', $students->pluck('id'))
                ->where('etablissement_id', $tenantId)
                ->get()
                ->groupBy('eleve_id');

            // 7. Aggregate absences and tardiness
            $annee = $classe->anneeScolaire;
            [$startDate, $endDate] = $this->getPeriodDateRange($periode, $annee);

            $allPresences = Presence::whereIn('eleve_id', $students->pluck('id'))
                ->whereBetween('date', [$startDate, $endDate])
                ->where('etablissement_id', $tenantId)
                ->get()
                ->groupBy('eleve_id');

            // Load per-class coefficients
            $classCoefficients = CoefficientClasseMatiere::where('classe_id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->get()
                ->keyBy('matiere_id');

            // Load school bulletin configuration
            $config = BulletinConfig::where('etablissement_id', $tenantId)->first();

            // Data structures to hold intermediate values for ranking and stats
            $studentAverages = []; // student_id => overall_average
            $studentSubjectGrades = []; // student_id => [matiere_id => average]
            $subjectAveragesList = []; // matiere_id => [ [student_id, average], ... ]

            // Initialize subject averages list
            foreach ($charges as $charge) {
                $subjectAveragesList[$charge->matiere_id] = [];
            }

            // --- First Pass: Calculate Subject Averages per Student (Weighted) ---
            foreach ($students as $student) {
                $studentId = $student->id;
                $studentDispenses = $allDispenses->get($studentId, collect());
                $studentNotes = $allNotes->get($studentId, collect());

                $studentSubjectGrades[$studentId] = [];

                foreach ($charges as $charge) {
                    $matiereId = $charge->matiere_id;

                    // Check if student is exempt from this subject
                    $isExempt = $studentDispenses->contains('matiere_id', $matiereId);
                    if ($isExempt) {
                        continue;
                    }

                    // Get exams for this subject
                    $subjectExams = $exams->where('matiere_id', $matiereId);
                    
                    $totalWeightedScore = 0;
                    $totalWeight = 0;
                    $hasAnyGrade = false;

                    foreach ($subjectExams as $exam) {
                        $note = $studentNotes->where('examen_id', $exam->id)->first();
                        if ($note && !$note->absent_justifie && !is_null($note->valeur)) {
                            $weight = $exam->poids ?? $exam->typeEvaluation?->poids_defaut ?? 1.0;
                            $totalWeightedScore += $note->valeur * $weight;
                            $totalWeight += $weight;
                            $hasAnyGrade = true;
                        }
                    }

                    $subjectAverage = $totalWeight > 0 ? $totalWeightedScore / $totalWeight : null;

                    if ($hasAnyGrade && !is_null($subjectAverage)) {
                        $studentSubjectGrades[$studentId][$matiereId] = $subjectAverage;
                        $subjectAveragesList[$matiereId][] = [
                            'student_id' => $studentId,
                            'average' => $subjectAverage,
                        ];
                    }
                }
            }

            // --- Second Pass: Calculate Subject Ranks & Stats ---
            $subjectStats = []; // matiere_id => [min, max, avg, ranks => [student_id => rank]]
            foreach ($charges as $charge) {
                $matiereId = $charge->matiere_id;
                $averages = $subjectAveragesList[$matiereId] ?? [];

                if (empty($averages)) {
                    $subjectStats[$matiereId] = [
                        'min' => null,
                        'max' => null,
                        'avg' => null,
                        'ranks' => [],
                    ];
                    continue;
                }

                // Sort averages descending for ranking
                usort($averages, fn($a, $b) => $b['average'] <=> $a['average']);

                $ranks = [];
                $currentRank = 1;
                foreach ($averages as $index => $item) {
                    if ($index > 0 && $item['average'] < $averages[$index - 1]['average']) {
                        $currentRank = $index + 1;
                    }
                    $ranks[$item['student_id']] = $currentRank;
                }

                $collect = collect($averages)->pluck('average');
                $subjectStats[$matiereId] = [
                    'min' => $collect->min(),
                    'max' => $collect->max(),
                    'avg' => $collect->avg(),
                    'ranks' => $ranks,
                ];
            }

            // --- Third Pass: Calculate Overall General Averages (Using Per-Class Coefficients) ---
            foreach ($students as $student) {
                $studentId = $student->id;
                $totalWeighted = 0;
                $totalCoef = 0;
                $hasAnyGrade = false;

                foreach ($charges as $charge) {
                    $matiereId = $charge->matiere_id;
                    if (isset($studentSubjectGrades[$studentId][$matiereId])) {
                        $classCoef = $classCoefficients->get($matiereId);
                        $coef = $classCoef?->coefficient ?? $charge->matiere->coefficient ?? 1.00;

                        $totalWeighted += $studentSubjectGrades[$studentId][$matiereId] * $coef;
                        $totalCoef += $coef;
                        $hasAnyGrade = true;
                    }
                }

                $overallAverage = null;
                if ($hasAnyGrade && $totalCoef > 0) {
                    $overallAverage = round($totalWeighted / $totalCoef, 2);
                }

                $studentAverages[$studentId] = $overallAverage;
            }

            // --- Fourth Pass: Calculate Class-wide Ranks and Class Average ---
            $validAverages = array_filter($studentAverages, fn($v) => !is_null($v));
            $classAverage = 0;
            $classRanks = [];

            if (!empty($validAverages)) {
                $classAverage = collect($validAverages)->avg();

                // Sort descending for ranking
                arsort($validAverages);
                
                $currentRank = 1;
                $index = 0;
                $prevValue = null;
                foreach ($validAverages as $sId => $avg) {
                    if ($index > 0 && $avg < $prevValue) {
                        $currentRank = $index + 1;
                    }
                    $classRanks[$sId] = $currentRank;
                    $prevValue = $avg;
                    $index++;
                }
            }

            // --- Fifth Pass: Save Bulletins and Details ---
            $generatedBulletins = [];

            foreach ($students as $student) {
                $studentId = $student->id;

                // Aggregate absences and tardiness (split by justified/unjustified)
                $presences = $allPresences->get($studentId, collect());
                $absJustifiees = $presences->where('statut', 'absent')->where('justifie', true)->count();
                $absInjustifiees = $presences->where('statut', 'absent')->where('justifie', false)->count();
                $retards = $presences->where('statut', 'retard')->count();
                $absencesCount = $absJustifiees + $absInjustifiees;

                // Auto-assign mentions based on configuration thresholds
                $mention = null;
                $overallAverage = $studentAverages[$studentId];
                if ($overallAverage !== null && $config) {
                    if ($overallAverage >= $config->seuil_felicitations) {
                        $mention = 'felicitations';
                    } elseif ($overallAverage >= $config->seuil_tableau_honneur) {
                        $mention = 'tableau_honneur';
                    } elseif ($overallAverage >= $config->seuil_encouragements) {
                        $mention = 'encouragements';
                    }
                }

                // Create or update bulletin (locked check done at controller/usecase)
                $bulletin = Bulletin::updateOrCreate(
                    [
                        'eleve_id' => $studentId,
                        'periode' => $periode,
                        'annee_scolaire' => $anneeScolaire,
                        'etablissement_id' => $tenantId,
                    ],
                    [
                        'classe_id' => $classeId,
                        'moyenne_generale' => $overallAverage,
                        'moyenne_classe' => round($classAverage, 2),
                        'rang_classe' => $classRanks[$studentId] ?? null,
                        'total_absences' => $absencesCount,
                        'absences_justifiees' => $absJustifiees,
                        'absences_injustifiees' => $absInjustifiees,
                        'retards' => $retards,
                        'mention' => $mention,
                        'status' => 'DRAFT',
                    ]
                );

                // Re-populate details
                // Delete existing details first
                BulletinDetail::where('bulletin_id', $bulletin->id)->delete();

                $detailsToInsert = [];
                $studentDispenses = $allDispenses->get($studentId, collect());
                $studentNotes = $allNotes->get($studentId, collect());

                foreach ($charges as $charge) {
                    $matiereId = $charge->matiere_id;
                    $isExempt = $studentDispenses->contains('matiere_id', $matiereId);

                    if ($isExempt) {
                        continue;
                    }

                    $moyStudent = $studentSubjectGrades[$studentId][$matiereId] ?? null;
                    $stats = $subjectStats[$matiereId] ?? null;

                    // Fetch per-class coefficient or fallback
                    $classCoef = $classCoefficients->get($matiereId);
                    $coef = $classCoef?->coefficient ?? $charge->matiere->coefficient ?? 1.00;

                    // Build notes detail JSON and calculate weighted subtotal
                    $subjectExams = $exams->where('matiere_id', $matiereId);
                    $notesBreakdown = [];
                    $sousTotalPondere = 0;

                    foreach ($subjectExams as $exam) {
                        $note = $studentNotes->where('examen_id', $exam->id)->first();
                        if ($note) {
                            $weight = $exam->poids ?? $exam->typeEvaluation?->poids_defaut ?? 1.0;
                            $notesBreakdown[] = [
                                'examen_id' => $exam->id,
                                'intitule' => $exam->intitule,
                                'type' => $exam->typeEvaluation?->code ?? 'N/A',
                                'valeur' => $note->valeur,
                                'poids' => $weight,
                                'absent' => (bool)$note->absent_justifie,
                            ];
                            if (!$note->absent_justifie && !is_null($note->valeur)) {
                                $sousTotalPondere += $note->valeur * $weight;
                            }
                        }
                    }

                    $detailsToInsert[] = [
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'bulletin_id' => $bulletin->id,
                        'matiere_id' => $matiereId,
                        'prof_id' => $charge->enseignant_id,
                        'etablissement_id' => $tenantId,
                        'coefficient' => $coef,
                        'moyenne_eleve' => $moyStudent,
                        'moyenne_min' => $stats['min'] ?? null,
                        'moyenne_max' => $stats['max'] ?? null,
                        'moyenne_classe_matiere' => $stats['avg'] ?? null,
                        'rang_matiere' => $stats['ranks'][$studentId] ?? null,
                        'appreciation_prof' => null,
                        'notes_detail' => json_encode($notesBreakdown),
                        'sous_total_pondere' => $sousTotalPondere,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if (!empty($detailsToInsert)) {
                    BulletinDetail::insert($detailsToInsert);
                }

                $generatedBulletins[] = $bulletin;
            }

            return $generatedBulletins;
        });
    }

    public function generateSingle(int $eleveId, string $periode, string $anneeScolaire): string
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $student = Eleve::where('id', $eleveId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        // Single generation runs for the student's entire class to compute class statistics correctly
        $this->generateBulk($student->classe_id, $periode, $anneeScolaire);

        $bulletin = Bulletin::where('eleve_id', $eleveId)
            ->where('periode', $periode)
            ->where('annee_scolaire', $anneeScolaire)
            ->firstOrFail();

        return $bulletin->id;
    }

    public function updateAppreciations(string $bulletinId, int $matiereId, string $appreciation, ?int $teacherId = null): void
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $detailQuery = BulletinDetail::where('bulletin_id', $bulletinId)
            ->where('matiere_id', $matiereId)
            ->where('etablissement_id', $tenantId);

        if ($teacherId) {
            $detailQuery->where('prof_id', $teacherId);
        }

        $detail = $detailQuery->firstOrFail();
        $detail->update(['appreciation_prof' => $appreciation]);
    }

    public function publish(string $bulletinId): void
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $bulletin = Bulletin::where('id', $bulletinId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $bulletin->update([
            'status' => 'PUBLISHED',
            'published_at' => now(),
        ]);
    }

    public function findWithDetails(string $bulletinId): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $bulletin = Bulletin::with([
            'eleve.user',
            'classe.section',
            'details.matiere.groupeMatiere',
            'details.prof.user',
            'etablissement'
        ])
            ->where('id', $bulletinId)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $bulletin ? $bulletin->toArray() : null;
    }

    public function getBulletinsByClasse(int $classeId, string $periode, string $anneeScolaire): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return Bulletin::with(['eleve'])
            ->where('classe_id', $classeId)
            ->where('periode', $periode)
            ->where('annee_scolaire', $anneeScolaire)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->toArray();
    }

    public function updateDecision(string $bulletinId, ?string $decision, ?string $mention, ?string $appreciationGenerale): void
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $bulletin = Bulletin::where('id', $bulletinId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $bulletin->update([
            'decision_conseil' => $decision ?: null,
            'mention' => $mention ?: null,
            'appreciation_generale' => $appreciationGenerale ?: null,
        ]);
    }

    public function validate(string $bulletinId, int $adminUserId): void
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $bulletin = Bulletin::where('id', $bulletinId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $bulletin->update([
            'status' => 'VALIDATED',
            'validated_by' => $adminUserId,
            'validated_at' => now(),
        ]);
    }

    /**
     * Determine start and end date ranges for school periods.
     */
    private function getPeriodDateRange(string $periode, $annee): array
    {
        $startYear = $annee->date_debut->year;
        $endYear = $annee->date_fin->year;

        switch ($periode) {
            case 'Trimestre 1':
                return [$annee->date_debut->toDateString(), "{$startYear}-12-31"];
            case 'Trimestre 2':
                return ["{$endYear}-01-01", "{$endYear}-03-31"];
            case 'Trimestre 3':
                return ["{$endYear}-04-01", $annee->date_fin->toDateString()];
            case 'Semestre 1':
                return [$annee->date_debut->toDateString(), "{$endYear}-01-31"];
            case 'Semestre 2':
                return ["{$endYear}-02-01", $annee->date_fin->toDateString()];
            default:
                return [$annee->date_debut->toDateString(), $annee->date_fin->toDateString()];
        }
    }
}
