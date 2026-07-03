<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\FinanceSoldePortInterface;
use App\Models\Solde;
use Illuminate\Support\Facades\Auth;

class EloquentFinanceSoldeRepository implements FinanceSoldePortInterface
{
    public function findByStudent(int $studentId): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $solde = Solde::where('eleve_id', $studentId)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $solde ? $solde->toArray() : null;
    }

    public function createOrUpdate(int $studentId, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update student balance.");
        }

        $solde = Solde::updateOrCreate(
            [
                'eleve_id' => $studentId,
                'etablissement_id' => $tenantId,
            ],
            [
                'montant_du' => $data['montant_du'] ?? 0.00,
                'montant_paye' => $data['montant_paye'] ?? 0.00,
            ]
        );

        // Fetch again to ensure virtual columns (generated) are properly refreshed in return data
        $refreshed = Solde::where('id', $solde->id)->first();

        return $refreshed ? $refreshed->toArray() : $solde->toArray();
    }
}
