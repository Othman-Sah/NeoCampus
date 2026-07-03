<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceRecetteDepensePortInterface;
use App\Models\RecetteDepense;
use Illuminate\Support\Facades\Auth;

class EloquentRecetteDepenseRepository implements FinanceRecetteDepensePortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $entry = RecetteDepense::with('saisieParUser')
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $entry ? $this->transformEntry($entry) : null;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = RecetteDepense::with('saisieParUser')
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }
        if (!empty($filters['categorie'])) {
            $query->where('categorie', $filters['categorie']);
        }

        return $query->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($e) {
                return $this->transformEntry($e);
            })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create an accounting entry.");
        }

        $entry = RecetteDepense::create([
            'etablissement_id' => $tenantId,
            'libelle' => $data['libelle'],
            'montant' => $data['montant'],
            'type' => $data['type'],
            'categorie' => $data['categorie'] ?? null,
            'date' => $data['date'],
            'justificatif' => $data['justificatif'] ?? null,
            'saisie_par' => $data['saisie_par'] ?? null,
        ]);

        return $this->findById($entry->id);
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update an accounting entry.");
        }

        $entry = RecetteDepense::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $entry->update(array_filter([
            'libelle' => $data['libelle'] ?? null,
            'montant' => isset($data['montant']) ? (float) $data['montant'] : null,
            'type' => $data['type'] ?? null,
            'categorie' => $data['categorie'] ?? null,
            'date' => $data['date'] ?? null,
            'justificatif' => $data['justificatif'] ?? null,
        ], function ($v) { return !is_null($v); }));

        if (array_key_exists('justificatif', $data)) {
            $entry->justificatif = $data['justificatif'];
        }
        if (array_key_exists('categorie', $data)) {
            $entry->categorie = $data['categorie'];
        }
        $entry->save();

        return $this->findById($entry->id);
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $entry = RecetteDepense::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$entry) return false;

        return (bool) $entry->delete();
    }

    private function transformEntry(RecetteDepense $e): array
    {
        $data = $e->toArray();
        if ($e->saisieParUser) {
            $data['saisie_par_user'] = [
                'id' => $e->saisieParUser->id,
                'nom' => $e->saisieParUser->nom,
                'prenom' => $e->saisieParUser->prenom,
            ];
        }
        return $data;
    }
}
