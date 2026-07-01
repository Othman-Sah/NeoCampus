<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\SalaryPortInterface;
use App\Models\EnseignantSalaire;
use App\Models\Enseignant;
use Illuminate\Support\Facades\Auth;

class EloquentSalaryRepository implements SalaryPortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $salary = EnseignantSalaire::with('enseignant.user')
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $salary ? $this->transformSalary($salary) : null;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = EnseignantSalaire::with('enseignant.user')
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['mois'])) {
            $query->where('mois', $filters['mois']);
        }
        if (!empty($filters['enseignant_id'])) {
            $query->where('enseignant_id', $filters['enseignant_id']);
        }
        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        return $query->get()->map(function ($s) {
            return $this->transformSalary($s);
        })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a salary record.");
        }

        $base = (float) ($data['salaire_de_base'] ?? 0.0);
        $primes = (float) ($data['primes'] ?? 0.0);
        $indemnites = (float) ($data['indemnites'] ?? 0.0);
        $retenues = (float) ($data['retenues'] ?? 0.0);
        $net = $base + $primes + $indemnites - $retenues;

        $salary = EnseignantSalaire::create([
            'etablissement_id' => $tenantId,
            'enseignant_id' => $data['enseignant_id'],
            'mois' => $data['mois'],
            'salaire_de_base' => $base,
            'primes' => $primes,
            'indemnites' => $indemnites,
            'retenues' => $retenues,
            'salaire_net' => $net,
            'statut' => $data['statut'] ?? 'Draft',
            'date_paiement' => $data['date_paiement'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return $this->findById($salary->id);
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a salary record.");
        }

        $salary = EnseignantSalaire::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $base = (float) (isset($data['salaire_de_base']) ? $data['salaire_de_base'] : $salary->salaire_de_base);
        $primes = (float) (isset($data['primes']) ? $data['primes'] : $salary->primes);
        $indemnites = (float) (isset($data['indemnites']) ? $data['indemnites'] : $salary->indemnites);
        $retenues = (float) (isset($data['retenues']) ? $data['retenues'] : $salary->retenues);
        $net = $base + $primes + $indemnites - $retenues;

        $salary->update(array_filter([
            'salaire_de_base' => isset($data['salaire_de_base']) ? $base : null,
            'primes' => isset($data['primes']) ? $primes : null,
            'indemnites' => isset($data['indemnites']) ? $indemnites : null,
            'retenues' => isset($data['retenues']) ? $retenues : null,
            'salaire_net' => $net,
            'statut' => $data['statut'] ?? null,
            'date_paiement' => $data['date_paiement'] ?? null,
            'notes' => $data['notes'] ?? null,
        ], function ($value) {
            return !is_null($value);
        }));

        if (array_key_exists('date_paiement', $data)) {
            $salary->date_paiement = $data['date_paiement'];
        }
        if (array_key_exists('notes', $data)) {
            $salary->notes = $data['notes'];
        }
        $salary->save();

        return $this->findById($salary->id);
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $salary = EnseignantSalaire::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$salary) return false;

        return (bool) $salary->delete();
    }

    public function findByTeacher(int $teacherId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return EnseignantSalaire::with('enseignant.user')
            ->where('enseignant_id', $teacherId)
            ->where('etablissement_id', $tenantId)
            ->orderBy('mois', 'desc')
            ->get()
            ->map(function ($s) {
                return $this->transformSalary($s);
            })->toArray();
    }

    private function transformSalary(EnseignantSalaire $s): array
    {
        $data = $s->toArray();
        if ($s->enseignant) {
            $data['enseignant'] = [
                'id' => $s->enseignant->id,
                'specialite' => $s->enseignant->specialite,
                'nom' => $s->enseignant->user->nom ?? null,
                'prenom' => $s->enseignant->user->prenom ?? null,
                'email' => $s->enseignant->user->email ?? null,
            ];
        }
        return $data;
    }
}
