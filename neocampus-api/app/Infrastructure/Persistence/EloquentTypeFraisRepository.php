<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceTypeFraisPortInterface;
use App\Models\TypeFrais;
use Illuminate\Support\Facades\Auth;

class EloquentTypeFraisRepository implements FinanceTypeFraisPortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $type = TypeFrais::with('groupe')
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $type ? $this->transformTypeFrais($type) : null;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = TypeFrais::with('groupe')
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['groupe_id'])) {
            $query->where('groupe_frais_id', $filters['groupe_id']);
        }

        return $query->get()->map(function ($t) {
            return $this->transformTypeFrais($t);
        })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a fee type.");
        }

        $type = TypeFrais::create([
            'etablissement_id' => $tenantId,
            'libelle' => $data['libelle'],
            'groupe_frais_id' => $data['groupe_frais_id'],
            'montant_par_defaut' => $data['montant_par_defaut'] ?? 0.00,
        ]);

        return $this->findById($type->id);
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a fee type.");
        }

        $type = TypeFrais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $type->update(array_filter([
            'libelle' => $data['libelle'] ?? null,
            'groupe_frais_id' => $data['groupe_frais_id'] ?? null,
            'montant_par_defaut' => isset($data['montant_par_defaut']) ? (float) $data['montant_par_defaut'] : null,
        ], function ($v) { return !is_null($v); }));

        return $this->findById($type->id);
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $type = TypeFrais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$type) return false;

        return (bool) $type->delete();
    }

    private function transformTypeFrais(TypeFrais $t): array
    {
        $data = $t->toArray();
        if ($t->groupe) {
            $data['groupe'] = $t->groupe->toArray();
        }
        return $data;
    }
}
