<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\PresencePortInterface;
use App\Models\Presence;
use App\Models\Eleve;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EloquentPresenceRepository implements PresencePortInterface
{
    public function submitBulk(int $seanceId, string $date, array $presences): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($seanceId, $date, $presences, $tenantId) {
            $results = [];
            foreach ($presences as $entry) {
                $presence = Presence::updateOrCreate(
                    [
                        'seance_id' => $seanceId,
                        'eleve_id' => $entry['eleve_id'],
                        'date' => $date,
                        'etablissement_id' => $tenantId,
                    ],
                    [
                        'statut' => $entry['statut'],
                        'motif' => $entry['motif'] ?? null,
                    ]
                );
                $results[] = $presence;
            }
            return $results;
        });
    }

    public function findByClasseAndDate(int $classeId, string $date): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        // Fetch students in this class
        $students = Eleve::where('classe_id', $classeId)
            ->where('etablissement_id', $tenantId)
            ->get();

        $studentIds = $students->pluck('id')->toArray();

        // Get presence records for these students on that date
        return Presence::with('seance')
            ->whereIn('eleve_id', $studentIds)
            ->where('date', $date)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->all();
    }

    public function findByEleve(int $eleveId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        return Presence::with('seance')
            ->where('eleve_id', $eleveId)
            ->where('etablissement_id', $tenantId)
            ->orderBy('date', 'desc')
            ->get()
            ->all();
    }

    public function searchPresences(array $filters): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        $query = Presence::with(['eleve.classe', 'seance.matiere'])
            ->where('etablissement_id', $tenantId)
            ->whereIn('statut', ['absent', 'retard']);

        // Date range filtering
        if (!empty($filters['range'])) {
            $range = $filters['range'];
            $today = now()->toDateString();
            if ($range === 'day') {
                $query->where('date', $today);
            } elseif ($range === 'month') {
                $query->where('date', '>=', now()->subDays(30)->toDateString());
            } elseif ($range === '3_months') {
                $query->where('date', '>=', now()->subDays(90)->toDateString());
            } elseif ($range === 'year') {
                $query->where('date', '>=', now()->subDays(365)->toDateString());
            }
        }

        // Student name or matricule search
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->whereHas('eleve', function ($q) use ($searchTerm) {
                $q->where('nom', 'like', $searchTerm)
                  ->orWhere('prenom', 'like', $searchTerm)
                  ->orWhere('matricule', 'like', $searchTerm);
            });
        }

        return $query->orderBy('date', 'desc')->get()->all();
    }

    public function updateStatus(int $id, string $statut, ?string $motif): ?object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return null;
        }

        $presence = Presence::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$presence) {
            return null;
        }

        $presence->statut = $statut;
        $presence->motif = $motif;
        $presence->save();

        return $presence;
    }
}
