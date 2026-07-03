<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceGroupeFraisPortInterface;
use App\Models\GroupeFrais;
use Illuminate\Support\Facades\Auth;

class EloquentGroupeFraisRepository implements FinanceGroupeFraisPortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $group = GroupeFrais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $group ? $group->toArray() : null;
    }

    public function findAll(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return GroupeFrais::where('etablissement_id', $tenantId)
            ->orderBy('nom', 'asc')
            ->get()
            ->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a group fee.");
        }

        $group = GroupeFrais::create([
            'etablissement_id' => $tenantId,
            'nom' => $data['nom'],
            'description' => $data['description'] ?? null,
        ]);

        return $group->toArray();
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a group fee.");
        }

        $group = GroupeFrais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $group->update(array_filter([
            'nom' => $data['nom'] ?? null,
            'description' => $data['description'] ?? null,
        ]));

        return $group->toArray();
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $group = GroupeFrais::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$group) return false;

        return (bool) $group->delete();
    }
}
