<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\SeancePortInterface;
use App\Models\Seance;
use Illuminate\Support\Facades\Auth;

class EloquentSeanceRepository implements SeancePortInterface
{
    public function findById(int $id): ?array
    {
        $seance = Seance::with(['classe', 'enseignant.user', 'matiere'])
            ->where('id', $id)
            ->first();

        return $seance ? $this->format($seance) : null;
    }

    public function findAllByClass(int $classId): array
    {
        $seances = Seance::with(['classe', 'enseignant.user', 'matiere'])
            ->where('classe_id', $classId)
            ->get();

        return $seances->map(fn($s) => $this->format($s))->toArray();
    }

    public function findAllByTeacher(int $teacherId): array
    {
        $seances = Seance::with(['classe', 'enseignant.user', 'matiere'])
            ->where('enseignant_id', $teacherId)
            ->get();

        return $seances->map(fn($s) => $this->format($s))->toArray();
    }

    public function create(array $data): array
    {
        $seance = Seance::create($data);
        return $this->findById($seance->id);
    }

    public function update(int $id, array $data): array
    {
        $seance = Seance::findOrFail($id);
        unset($data['etablissement_id']);
        $seance->update($data);
        return $this->findById($seance->id);
    }

    public function delete(int $id): bool
    {
        $seance = Seance::find($id);
        if (!$seance) {
            return false;
        }
        return (bool) $seance->delete();
    }

    /**
     * Checks if there's an overlapping session.
     * Return true if conflict exists, false otherwise.
     */
    public function hasConflict(string $jour, string $start, string $end, ?int $classId, ?int $teacherId, ?int $excludeId = null): bool
    {
        $query = Seance::where('jour', $jour)
            ->where(function ($q) use ($start, $end) {
                // Check if the times overlap: (heure_debut < end) AND (heure_fin > start)
                $q->where('heure_debut', '<', $end)
                  ->where('heure_fin', '>', $start);
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $query->where(function ($q) use ($classId, $teacherId) {
            if ($classId && $teacherId) {
                $q->where('classe_id', $classId)
                  ->orWhere('enseignant_id', $teacherId);
            } elseif ($classId) {
                $q->where('classe_id', $classId);
            } elseif ($teacherId) {
                $q->where('enseignant_id', $teacherId);
            }
        });

        return $query->exists();
    }

    private function format(Seance $seance): array
    {
        return [
            'id' => $seance->id,
            'jour' => $seance->jour,
            'heure_debut' => substr($seance->heure_debut, 0, 5),
            'heure_fin' => substr($seance->heure_fin, 0, 5),
            'classe_id' => $seance->classe_id,
            'classe_nom' => $seance->classe->nom ?? null,
            'enseignant_id' => $seance->enseignant_id,
            'enseignant_nom' => $seance->enseignant && $seance->enseignant->user 
                ? ($seance->enseignant->user->prenom . ' ' . $seance->enseignant->user->nom)
                : null,
            'matiere_id' => $seance->matiere_id,
            'matiere_nom' => $seance->matiere->nom ?? null,
            'matiere_intitule' => $seance->matiere->intitule ?? ($seance->matiere->nom ?? null),
            'etablissement_id' => $seance->etablissement_id,
        ];
    }
}
