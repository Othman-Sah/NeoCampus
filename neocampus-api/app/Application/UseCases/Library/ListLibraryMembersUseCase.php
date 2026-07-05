<?php

namespace App\Application\UseCases\Library;

use App\Models\Adherent;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListLibraryMembersUseCase
{
    private GetLibrarySettingsUseCase $getSettingsUseCase;

    public function __construct(GetLibrarySettingsUseCase $getSettingsUseCase)
    {
        $this->getSettingsUseCase = $getSettingsUseCase;
    }

    public function execute(int $tenantId, int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        $settings = $this->getSettingsUseCase->execute($tenantId);
        $finePerDay = $settings['fine_per_day_mad'] ?? 2;

        $query = Adherent::with(['userModel', 'emprunts' => function ($q) {
            $q->whereNull('deleted_at');
        }])->where('etablissement_id', $tenantId);

        if (!empty($search)) {
            $query->whereHas('userModel', function ($sub) use ($search) {
                $sub->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->transform(function ($adherent) use ($finePerDay) {
            $activeLoans = 0;
            $overdueLoans = 0;
            $totalUnpaidFines = 0;

            foreach ($adherent->emprunts as $loan) {
                $isReturned = ($loan->statut === 'rendu' || !is_null($loan->date_retour_effective));
                $dateRetourPrevue = Carbon::parse($loan->date_retour_prevue)->startOfDay();
                $isOverdue = !$isReturned && ($loan->statut === 'en_retard' || now()->startOfDay()->greaterThan($dateRetourPrevue));

                if (!$isReturned) {
                    $activeLoans++;
                    if ($isOverdue) {
                        $overdueLoans++;
                    }
                }

                if (!$loan->amende_payee && !$loan->amende_annulee) {
                    $joursRetard = 0;
                    if ($isReturned) {
                        $dateEffective = Carbon::parse($loan->date_retour_effective)->startOfDay();
                        if ($dateEffective->greaterThan($dateRetourPrevue)) {
                            $joursRetard = $dateEffective->diffInDays($dateRetourPrevue);
                        }
                    } else {
                        if (now()->startOfDay()->greaterThan($dateRetourPrevue)) {
                            $joursRetard = now()->startOfDay()->diffInDays($dateRetourPrevue);
                        }
                    }

                    if ($joursRetard > 0) {
                        $totalUnpaidFines += ($joursRetard * $finePerDay);
                    }
                }
            }

            $fullName = trim(($adherent->userModel->prenom ?? '') . ' ' . ($adherent->userModel->nom ?? ''));
            if (empty($fullName)) {
                $fullName = 'Membre Inconnu';
            }

            $type = $adherent->user_type ? class_basename($adherent->user_type) : 'Membre';
            if ($type === 'Eleve') {
                $type = 'Élève';
            }

            $adherent->active_loans_count = $activeLoans;
            $adherent->overdue_loans_count = $overdueLoans;
            $adherent->total_unpaid_fines = $totalUnpaidFines;
            $adherent->full_name = $fullName;
            $adherent->type = $type;

            return $adherent;
        });

        return $paginator;
    }
}
