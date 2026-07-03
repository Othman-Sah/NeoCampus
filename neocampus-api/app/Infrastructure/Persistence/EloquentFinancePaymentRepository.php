<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinancePaymentPortInterface;
use App\Models\Paiement;
use Illuminate\Support\Facades\Auth;

class EloquentFinancePaymentRepository implements FinancePaymentPortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $payment = Paiement::with('comptable')
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $payment ? $this->transformPayment($payment) : null;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = Paiement::with(['comptable', 'frais.eleve', 'frais.typeFrais'])
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['date_from'])) {
            $query->whereDate('date_paiement', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('date_paiement', '<=', $filters['date_to']);
        }
        if (!empty($filters['mode'])) {
            $query->where('mode', $filters['mode']);
        }
        if (!empty($filters['eleve_id'])) {
            $query->whereHas('frais', function ($q) use ($filters) {
                $q->where('eleve_id', $filters['eleve_id']);
            });
        }

        return $query->orderBy('date_paiement', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                return $this->transformPayment($p);
            })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to record a payment.");
        }

        $payment = Paiement::create([
            'etablissement_id' => $tenantId,
            'frais_id' => $data['frais_id'],
            'montant_paye' => $data['montant_paye'],
            'date_paiement' => $data['date_paiement'],
            'mode' => $data['mode'],
            'reference' => $data['reference'] ?? null,
            'comptable_id' => $data['comptable_id'] ?? null,
        ]);

        return $this->findById($payment->id);
    }

    public function findByFee(int $feeId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return Paiement::with('comptable')
            ->where('frais_id', $feeId)
            ->where('etablissement_id', $tenantId)
            ->orderBy('date_paiement', 'asc')
            ->get()
            ->map(function ($p) {
                return $this->transformPayment($p);
            })->toArray();
    }

    private function transformPayment(Paiement $p): array
    {
        $data = $p->toArray();
        if ($p->comptable) {
            $data['comptable'] = [
                'id' => $p->comptable->id,
                'nom' => $p->comptable->nom,
                'prenom' => $p->comptable->prenom,
                // Email and password excluded in API response, done here for safety
            ];
        }
        if ($p->relationLoaded('frais') && $p->frais) {
            $data['frais'] = $p->frais->toArray();
            if ($p->frais->eleve) {
                $data['frais']['eleve'] = [
                    'id' => $p->frais->eleve->id,
                    'nom' => $p->frais->eleve->nom,
                    'prenom' => $p->frais->eleve->prenom,
                    'matricule' => $p->frais->eleve->matricule,
                ];
            }
            if ($p->frais->typeFrais) {
                $data['frais']['type_frais'] = $p->frais->typeFrais->toArray();
            }
        }
        return $data;
    }
}
