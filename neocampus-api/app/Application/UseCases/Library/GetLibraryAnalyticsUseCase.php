<?php

namespace App\Application\UseCases\Library;

use App\Models\Livre;
use App\Models\Emprunt;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GetLibraryAnalyticsUseCase
{
    private GetLibrarySettingsUseCase $getSettingsUseCase;

    public function __construct(GetLibrarySettingsUseCase $getSettingsUseCase)
    {
        $this->getSettingsUseCase = $getSettingsUseCase;
    }

    public function execute(int $tenantId): array
    {
        $settings = $this->getSettingsUseCase->execute($tenantId);
        $finePerDay = $settings['fine_per_day_mad'] ?? 2;

        // 1. Top 5 most borrowed books
        $topBooks = Livre::join('emprunts', 'livres.id', '=', 'emprunts.livre_id')
            ->select('livres.id', 'livres.titre', 'livres.auteur', DB::raw('COUNT(emprunts.id) as borrow_count'))
            ->where('livres.etablissement_id', $tenantId)
            ->whereNull('emprunts.deleted_at')
            ->groupBy('livres.id', 'livres.titre', 'livres.auteur')
            ->orderByDesc('borrow_count')
            ->limit(5)
            ->get()
            ->toArray();

        // 2. Top 5 most borrowed genres
        $topGenres = Livre::join('emprunts', 'livres.id', '=', 'emprunts.livre_id')
            ->select('livres.genre', DB::raw('COUNT(emprunts.id) as borrow_count'))
            ->where('livres.etablissement_id', $tenantId)
            ->whereNull('emprunts.deleted_at')
            ->groupBy('livres.genre')
            ->orderByDesc('borrow_count')
            ->limit(5)
            ->get()
            ->toArray();

        // 3. Monthly borrowing trends (last 6 months)
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $label = $date->translatedFormat('F Y');
            $trends[$key] = ['month' => $label, 'borrow_count' => 0];
        }

        $monthlyCounts = Emprunt::select(DB::raw("DATE_FORMAT(date_emprunt, '%Y-%m') as month_key"), DB::raw('COUNT(*) as count'))
            ->where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->where('date_emprunt', '>=', now()->subMonths(5)->startOfMonth()->toDateString())
            ->groupBy('month_key')
            ->get();

        foreach ($monthlyCounts as $row) {
            if (isset($trends[$row->month_key])) {
                $trends[$row->month_key]['borrow_count'] = (int) $row->count;
            }
        }
        $monthlyTrends = array_values($trends);

        // 4. Overdue vs. returned loan ratio
        $totalReturned = Emprunt::where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->where('statut', 'rendu')
                  ->orWhereNotNull('date_retour_effective');
            })
            ->count();

        $totalOverdue = Emprunt::where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->whereNull('date_retour_effective')
            ->where(function ($q) {
                $q->where('statut', 'en_retard')
                  ->orWhere('date_retour_prevue', '<', now()->toDateString());
            })
            ->count();

        $totalActiveOnTime = Emprunt::where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->whereNull('date_retour_effective')
            ->where('date_retour_prevue', '>=', now()->toDateString())
            ->count();

        // 5. Fine collections vs. collected fines
        $fineLoans = Emprunt::where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->where(function ($q) {
                // Overdue
                $q->where(function ($sub) {
                    $sub->whereNull('date_retour_effective')
                        ->where(function ($subSub) {
                            $subSub->where('statut', 'en_retard')
                                  ->orWhere('date_retour_prevue', '<', now()->toDateString());
                        });
                })
                // Late return
                ->orWhere(function ($sub) {
                    $sub->whereNotNull('date_retour_effective')
                        ->whereColumn('date_retour_effective', '>', 'date_retour_prevue');
                });
            })
            ->get();

        $collectedFines = 0;
        $outstandingFines = 0;
        $waivedFines = 0;

        foreach ($fineLoans as $loan) {
            $dateRetourPrevue = Carbon::parse($loan->date_retour_prevue)->startOfDay();
            $dateEffective = !is_null($loan->date_retour_effective)
                ? Carbon::parse($loan->date_retour_effective)->startOfDay()
                : now()->startOfDay();

            $joursRetard = 0;
            if ($dateEffective->greaterThan($dateRetourPrevue)) {
                $joursRetard = $dateEffective->diffInDays($dateRetourPrevue);
            }
            $fine = $joursRetard * $finePerDay;

            if ($loan->amende_payee) {
                $collectedFines += $fine;
            } elseif ($loan->amende_annulee) {
                $waivedFines += $fine;
            } else {
                $outstandingFines += $fine;
            }
        }

        $totalLoans = $totalReturned + $totalOverdue + $totalActiveOnTime;
        $overdueRate = $totalLoans > 0 ? round(($totalOverdue / $totalLoans) * 100, 1) : 0;
        
        $activeBorrowers = Emprunt::where('etablissement_id', $tenantId)
            ->whereNull('deleted_at')
            ->distinct('adherent_id')
            ->count('adherent_id');

        return [
            'top_books' => $topBooks,
            'top_genres' => $topGenres,
            'monthly_trends' => $monthlyTrends,
            'kpis' => [
                'overdue_rate' => $overdueRate,
                'active_borrowers' => $activeBorrowers,
                'total_collected_fines' => $collectedFines,
                'total_outstanding_fines' => $outstandingFines,
                'total_waived_fines' => $waivedFines,
            ],
            'loan_ratio' => [
                'returned' => $totalReturned,
                'overdue' => $totalOverdue,
                'active_on_time' => $totalActiveOnTime,
            ],
            'fines' => [
                'collected' => $collectedFines,
                'outstanding' => $outstandingFines,
                'waived' => $waivedFines,
            ],
        ];
    }
}
