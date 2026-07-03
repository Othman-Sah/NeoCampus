<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceFeePortInterface;
use App\Models\Frais;
use App\Models\Remise;
use App\Models\Penalite;
use Illuminate\Support\Facades\Auth;

class EloquentFinanceFeeRepository implements FinanceFeePortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $fee = Frais::with(['typeFrais.groupe', 'remises.user', 'penalites.user', 'paiements.comptable'])
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $fee ? $this->transformFee($fee) : null;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = Frais::with(['typeFrais.groupe', 'remises.user', 'penalites.user', 'paiements.comptable'])
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['eleve_id'])) {
            $query->where('eleve_id', $filters['eleve_id']);
        }
        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }
        if (!empty($filters['annee_scolaire'])) {
            $query->where('annee_scolaire', $filters['annee_scolaire']);
        }

        return $query->orderBy('date_echeance', 'asc')->get()->map(function ($f) {
            return $this->transformFee($f);
        })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a fee.");
        }

        $fee = Frais::create([
            'etablissement_id' => $tenantId,
            'type_frais_id' => $data['type_frais_id'],
            'eleve_id' => $data['eleve_id'],
            'montant' => $data['montant'],
            'date_echeance' => $data['date_echeance'],
            'statut' => $data['statut'] ?? 'en_attente',
            'annee_scolaire' => $data['annee_scolaire'] ?? null,
        ]);

        return $this->findById($fee->id);
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a fee.");
        }

        $fee = Frais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $fee->update(array_filter([
            'montant' => isset($data['montant']) ? (float) $data['montant'] : null,
            'date_echeance' => $data['date_echeance'] ?? null,
            'statut' => $data['statut'] ?? null,
            'annee_scolaire' => $data['annee_scolaire'] ?? null,
        ], function ($v) { return !is_null($v); }));

        return $this->findById($fee->id);
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $fee = Frais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$fee) return false;

        return (bool) $fee->delete();
    }

    public function applyRemise(int $feeId, array $data): array
    {
        $remise = Remise::create([
            'frais_id' => $feeId,
            'pourcentage' => $data['pourcentage'],
            'motif' => $data['motif'] ?? null,
            'applique_par' => $data['applique_par'] ?? null,
        ]);

        return $remise->load('user')->toArray();
    }

    public function applyPenalite(int $feeId, array $data): array
    {
        $penalite = Penalite::create([
            'frais_id' => $feeId,
            'montant' => $data['montant'],
            'motif' => $data['motif'] ?? null,
            'applique_par' => $data['applique_par'] ?? null,
        ]);

        return $penalite->load('user')->toArray();
    }

    private function transformFee(Frais $f): array
    {
        $data = $f->toArray();
        if ($f->typeFrais) {
            $data['type_frais'] = $f->typeFrais->toArray();
            if ($f->typeFrais->groupe) {
                $data['type_frais']['groupe'] = $f->typeFrais->groupe->toArray();
            }
        }
        $data['remises'] = $f->remises->map(function ($r) {
            $rArray = $r->toArray();
            if ($r->user) {
                $rArray['user'] = [
                    'id' => $r->user->id,
                    'nom' => $r->user->nom,
                    'prenom' => $r->user->prenom,
                ];
            }
            return $rArray;
        })->toArray();

        $data['penalites'] = $f->penalites->map(function ($p) {
            $pArray = $p->toArray();
            if ($p->user) {
                $pArray['user'] = [
                    'id' => $p->user->id,
                    'nom' => $p->user->nom,
                    'prenom' => $p->user->prenom,
                ];
            }
            return $pArray;
        })->toArray();

        $data['paiements'] = $f->paiements->map(function ($pay) {
            $payArray = $pay->toArray();
            if ($pay->comptable) {
                $payArray['comptable'] = [
                    'id' => $pay->comptable->id,
                    'nom' => $pay->comptable->nom,
                    'prenom' => $pay->comptable->prenom,
                ];
            }
            return $payArray;
        })->toArray();

        return $data;
    }
}
