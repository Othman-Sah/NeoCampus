<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceReportPortInterface;
use App\Models\Paiement;
use App\Models\Solde;
use Illuminate\Support\Facades\Auth;

class EloquentFinanceReportRepository implements FinanceReportPortInterface
{
    public function getSummary(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [
                'total_encaisse' => 0.00,
                'soldes_impayes' => 0.00,
                'paiements_aujourd_hui' => 0,
                'period' => 'unknown'
            ];
        }

        // Parse date filters, default to current month
        $from = !empty($filters['from']) ? $filters['from'] : date('Y-m-01');
        $to = !empty($filters['to']) ? $filters['to'] : date('Y-m-t');

        $totalEncaisse = (float) Paiement::where('etablissement_id', $tenantId)
            ->whereDate('date_paiement', '>=', $from)
            ->whereDate('date_paiement', '<=', $to)
            ->sum('montant_paye');

        $soldesImpayes = (float) Solde::where('etablissement_id', $tenantId)
            ->sum('montant_du') - (float) Solde::where('etablissement_id', $tenantId)->sum('montant_paye');
        
        // Safety check to ensure outstanding is not negative
        if ($soldesImpayes < 0) {
            $soldesImpayes = 0.00;
        }

        $paiementsAujourdHui = Paiement::where('etablissement_id', $tenantId)
            ->whereDate('date_paiement', date('Y-m-d'))
            ->count();

        return [
            'total_encaisse' => $totalEncaisse,
            'soldes_impayes' => $soldesImpayes,
            'paiements_aujourd_hui' => $paiementsAujourdHui,
            'period' => "{$from} to {$to}"
        ];
    }

    public function getTransactions(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = Paiement::with(['comptable', 'frais.eleve', 'frais.typeFrais'])
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['from'])) {
            $query->whereDate('date_paiement', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $query->whereDate('date_paiement', '<=', $filters['to']);
        }
        if (!empty($filters['mode'])) {
            $query->where('mode', $filters['mode']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('frais.eleve', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('date_paiement', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'date_paiement' => $p->date_paiement,
                    'montant_paye' => (float) $p->montant_paye,
                    'mode' => $p->mode,
                    'reference' => $p->reference,
                    'eleve_nom' => $p->frais->eleve->nom ?? null,
                    'eleve_prenom' => $p->frais->eleve->prenom ?? null,
                    'eleve_matricule' => $p->frais->eleve->matricule ?? null,
                    'type_frais_libelle' => $p->frais->typeFrais->libelle ?? null,
                    'comptable_nom' => $p->comptable ? ($p->comptable->prenom . ' ' . $p->comptable->nom) : null,
                ];
            })->toArray();
    }
}
