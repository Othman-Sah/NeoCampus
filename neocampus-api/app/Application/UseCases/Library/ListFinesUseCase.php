<?php

namespace App\Application\UseCases\Library;

use App\Models\Emprunt;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListFinesUseCase
{
    private GetLibrarySettingsUseCase $getSettingsUseCase;

    public function __construct(GetLibrarySettingsUseCase $getSettingsUseCase)
    {
        $this->getSettingsUseCase = $getSettingsUseCase;
    }

    public function execute(int $tenantId, int $perPage = 15, ?string $status = null, ?string $search = null): LengthAwarePaginator
    {
        $settings = $this->getSettingsUseCase->execute($tenantId);
        $finePerDay = $settings['fine_per_day_mad'] ?? 2;

        $query = Emprunt::with(['livre', 'adherent.user'])
            ->where('etablissement_id', $tenantId)
            ->where(function ($q) {
                // Currently overdue (statut = 'en_retard' or date_retour_effective is null and date_retour_prevue < now())
                $q->where(function ($sub) {
                    $sub->whereNull('date_retour_effective')
                        ->where(function ($subSub) {
                            $subSub->where('statut', 'en_retard')
                                  ->orWhere('date_retour_prevue', '<', now()->toDateString());
                        });
                })
                // Or returned late (date_retour_effective > date_retour_prevue)
                ->orWhere(function ($sub) {
                    $sub->whereNotNull('date_retour_effective')
                        ->whereColumn('date_retour_effective', '>', 'date_retour_prevue');
                });
            });

        // Filter by fine status if provided (unpaid, paid, waived)
        if ($status === 'unpaid') {
            $query->where('amende_payee', false)->where('amende_annulee', false);
        } elseif ($status === 'paid') {
            $query->where('amende_payee', true);
        } elseif ($status === 'waived') {
            $query->where('amende_annulee', true);
        }

        // Search by book title or member name
        if (!empty($search)) {
            $query->where(function ($sub) use ($search) {
                $sub->whereHas('livre', function ($b) use ($search) {
                    $b->where('titre', 'like', "%{$search}%");
                })->orWhereHas('adherent.userModel', function ($u) use ($search) {
                    $u->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%");
                });
            });
        }

        $paginator = $query->orderBy('date_retour_prevue', 'desc')->paginate($perPage);

        $paginator->getCollection()->transform(function ($loan) use ($finePerDay) {
            $dateRetourPrevue = Carbon::parse($loan->date_retour_prevue)->startOfDay();
            $dateEffective = !is_null($loan->date_retour_effective)
                ? Carbon::parse($loan->date_retour_effective)->startOfDay()
                : now()->startOfDay();

            $joursRetard = 0;
            if ($dateEffective->greaterThan($dateRetourPrevue)) {
                $joursRetard = $dateEffective->diffInDays($dateRetourPrevue);
            }

            $loan->jours_retard = $joursRetard;
            $loan->amende = $joursRetard * $finePerDay;

            return $loan;
        });

        return $paginator;
    }
}
