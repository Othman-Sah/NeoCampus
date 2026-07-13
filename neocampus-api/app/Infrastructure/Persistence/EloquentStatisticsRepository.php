<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\StatisticsRepositoryInterface;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Classe;
use App\Models\Presence;
use App\Models\Frais;
use App\Models\Paiement;
use App\Models\Note;
use App\Models\Examen;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EloquentStatisticsRepository implements StatisticsRepositoryInterface
{
    public function getOverviewStats(int $tenantId): array
    {
        $totalEleves = Eleve::where('etablissement_id', $tenantId)->count();
        $totalEnseignants = Enseignant::where('etablissement_id', $tenantId)->count();
        $totalClasses = Classe::where('etablissement_id', $tenantId)->count();

        // Attendance rate today
        $today = Carbon::today()->toDateString();
        $totalToday = Presence::where('etablissement_id', $tenantId)
            ->whereDate('date', $today)
            ->count();

        $presentToday = Presence::where('etablissement_id', $tenantId)
            ->whereDate('date', $today)
            ->whereIn('statut', ['present', 'retard'])
            ->count();

        $attendanceRate = $totalToday > 0 ? round(($presentToday / $totalToday) * 100, 1) : 100.0;

        // Collection rate this month
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $feesThisMonth = Frais::where('etablissement_id', $tenantId)
            ->whereBetween('date_echeance', [$startOfMonth, $endOfMonth])
            ->with(['remises', 'penalites', 'paiements'])
            ->get();

        $totalNetDue = 0.0;
        $totalPaid = 0.0;

        foreach ($feesThisMonth as $fee) {
            $base = (float) $fee->montant;
            $remise = 0.0;
            foreach ($fee->remises as $r) {
                $remise += $base * ((float) $r->pourcentage / 100);
            }
            $penalite = 0.0;
            foreach ($fee->penalites as $p) {
                $penalite += (float) $p->montant;
            }
            $net = $base - $remise + $penalite;
            $totalNetDue += $net;

            foreach ($fee->paiements as $pay) {
                $totalPaid += (float) $pay->montant_paye;
            }
        }

        $collectionRate = $totalNetDue > 0 ? round(($totalPaid / $totalNetDue) * 100, 1) : 100.0;

        $roleCounts = User::where('etablissement_id', $tenantId)
            ->select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->pluck('total', 'role')
            ->toArray();

        return [
            'total_eleves' => $totalEleves,
            'total_enseignants' => $totalEnseignants,
            'total_classes' => $totalClasses,
            'attendance_rate_today' => $attendanceRate,
            'collection_rate_month' => $collectionRate,
            'total_parents' => (int) ($roleCounts['parent'] ?? 0),
            'total_comptables' => (int) ($roleCounts['comptable'] ?? 0),
            'total_bibliothecaires' => (int) ($roleCounts['bibliothecaire'] ?? 0),
            'total_admins' => (int) ($roleCounts['admin'] ?? 0),
        ];
    }

    public function getAttendanceTrend(int $tenantId, string $period): array
    {
        $days = $period === 'week' ? 7 : 30;
        $startDate = Carbon::today()->subDays($days - 1)->toDateString();
        $endDate = Carbon::today()->toDateString();

        $stats = Presence::where('etablissement_id', $tenantId)
            ->whereBetween('date', [$startDate, $endDate])
            ->select('date', 
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN statut IN ("present", "retard") THEN 1 ELSE 0 END) as present_count')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $trend = [];
        $rates = [];
        foreach ($stats as $stat) {
            $rates[$stat->date] = $stat->total > 0 ? round(($stat->present_count / $stat->total) * 100, 1) : 100.0;
        }

        for ($i = 0; $i < $days; $i++) {
            $dateStr = Carbon::today()->subDays($days - 1 - $i)->toDateString();
            $trend[] = [
                'date' => $dateStr,
                'attendance_rate' => $rates[$dateStr] ?? 100.0,
            ];
        }

        return $trend;
    }

    public function getGradeDistribution(int $tenantId): array
    {
        $stats = Note::where('notes.etablissement_id', $tenantId)
            ->join('examens', 'notes.examen_id', '=', 'examens.id')
            ->join('matieres', 'examens.matiere_id', '=', 'matieres.id')
            ->select('matieres.nom as subject',
                DB::raw('ROUND(AVG(notes.valeur), 1) as average_grade'),
                DB::raw('ROUND(MIN(notes.valeur), 1) as min_grade'),
                DB::raw('ROUND(MAX(notes.valeur), 1) as max_grade')
            )
            ->groupBy('matieres.id', 'matieres.nom')
            ->get();

        return $stats->map(fn($item) => [
            'subject' => $item->subject,
            'average_grade' => (float) $item->average_grade,
            'min_grade' => (float) $item->min_grade,
            'max_grade' => (float) $item->max_grade,
        ])->toArray();
    }

    public function getFinanceTrend(int $tenantId, string $period): array
    {
        $trend = [];
        
        $frenchMonths = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];

        for ($i = 5; $i >= 0; $i--) {
            $carbonMonth = Carbon::now()->subMonths($i);
            $monthNum = (int) $carbonMonth->format('n');
            $monthLabel = $frenchMonths[$monthNum] ?? $carbonMonth->format('F');
            
            $monthStart = $carbonMonth->startOfMonth()->toDateString();
            $monthEnd = $carbonMonth->endOfMonth()->toDateString();

            // Re-fetch carbonMonth for calculations as startOfMonth modifies the instance
            $carbonMonth = Carbon::now()->subMonths($i);

            $fees = Frais::where('etablissement_id', $tenantId)
                ->whereBetween('date_echeance', [$monthStart, $monthEnd])
                ->with(['remises', 'penalites', 'paiements'])
                ->get();

            $totalNetDue = 0.0;
            $totalCollected = 0.0;

            foreach ($fees as $fee) {
                $base = (float) $fee->montant;
                $remise = 0.0;
                foreach ($fee->remises as $r) {
                    $remise += $base * ((float) $r->pourcentage / 100);
                }
                $penalite = 0.0;
                foreach ($fee->penalites as $p) {
                    $penalite += (float) $p->montant;
                }
                $net = $base - $remise + $penalite;
                $totalNetDue += $net;

                foreach ($fee->paiements as $pay) {
                    $totalCollected += (float) $pay->montant_paye;
                }
            }

            $outstanding = max(0.0, $totalNetDue - $totalCollected);

            $trend[] = [
                'month' => $monthLabel,
                'collected' => round($totalCollected, 2),
                'outstanding' => round($outstanding, 2),
            ];
        }

        return $trend;
    }

    public function getUpcomingExams(int $tenantId, int $limit): array
    {
        $exams = Examen::where('etablissement_id', $tenantId)
            ->where('date', '>=', Carbon::now()->toDateString())
            ->with(['matiere', 'classe'])
            ->orderBy('date', 'asc')
            ->limit($limit)
            ->get();

        return $exams->map(fn($exam) => [
            'id' => $exam->id,
            'title' => $exam->intitule,
            'subject' => $exam->matiere->nom ?? 'N/A',
            'class_name' => $exam->classe->nom ?? 'N/A',
            'date' => $exam->date->format('Y-m-d H:i:s'),
        ])->toArray();
    }

    public function getRecentActivities(int $tenantId, int $limit): array
    {
        $payments = Paiement::where('etablissement_id', $tenantId)
            ->with(['frais.eleve.user', 'comptable'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $presences = Presence::where('etablissement_id', $tenantId)
            ->where('statut', 'absent')
            ->with(['eleve.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $exams = Examen::where('etablissement_id', $tenantId)
            ->with(['matiere', 'classe'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $activities = [];

        foreach ($payments as $payment) {
            $studentName = isset($payment->frais->eleve) 
                ? ($payment->frais->eleve->prenom . ' ' . $payment->frais->eleve->nom) 
                : 'Élève';
            $comptableName = $payment->comptable->nom ?? 'Comptable';
            $activities[] = [
                'id' => $payment->id,
                'action' => 'Paiement enregistré',
                'description' => "Frais de scolarité réglés pour l'élève " . $studentName,
                'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
                'user_name' => $comptableName,
                'timestamp' => $payment->created_at->timestamp,
            ];
        }

        foreach ($presences as $presence) {
            $studentName = isset($presence->eleve) 
                ? ($presence->eleve->prenom . ' ' . $presence->eleve->nom) 
                : 'Élève';
            $activities[] = [
                'id' => $presence->id,
                'action' => 'Absence enregistrée',
                'description' => "Absence pour l'élève " . $studentName,
                'created_at' => $presence->created_at->format('Y-m-d H:i:s'),
                'user_name' => 'Enseignant',
                'timestamp' => $presence->created_at->timestamp,
            ];
        }

        foreach ($exams as $exam) {
            $matiereName = $exam->matiere->nom ?? 'Matière';
            $classeName = $exam->classe->nom ?? 'Classe';
            $activities[] = [
                'id' => $exam->id,
                'action' => 'Examen planifié',
                'description' => "Examen de " . $matiereName . " planifié pour la classe " . $classeName,
                'created_at' => $exam->created_at->format('Y-m-d H:i:s'),
                'user_name' => 'Administration',
                'timestamp' => $exam->created_at->timestamp,
            ];
        }

        usort($activities, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        $activities = array_slice($activities, 0, $limit);
        return array_map(function($act) {
            unset($act['timestamp']);
            return $act;
        }, $activities);
    }
}
