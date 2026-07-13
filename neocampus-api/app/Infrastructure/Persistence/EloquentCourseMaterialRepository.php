<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\CourseMaterialPortInterface;
use App\Models\Support;
use App\Models\Devoir;

class EloquentCourseMaterialRepository implements CourseMaterialPortInterface
{
    public function listSupports(int $classeId, ?int $matiereId = null): array
    {
        $query = Support::where('classe_id', $classeId)
            ->with(['matiere', 'enseignant.user']);

        if ($matiereId) {
            $query->where('matiere_id', $matiereId);
        }

        return $query->orderBy('created_at', 'desc')->get()->all();
    }

    public function createSupport(array $data): Support
    {
        $support = Support::create($data);
        return $support->load(['matiere', 'enseignant.user']);
    }

    public function deleteSupport(int $id): bool
    {
        $support = Support::find($id);
        if ($support) {
            return (bool)$support->delete();
        }
        return false;
    }

    public function listHomework(int $classeId, ?int $matiereId = null): array
    {
        $query = Devoir::where('classe_id', $classeId)
            ->with(['matiere', 'enseignant.user']);

        if ($matiereId) {
            $query->where('matiere_id', $matiereId);
        }

        return $query->orderBy('date_echeance', 'asc')->get()->all();
    }

    public function createHomework(array $data): Devoir
    {
        $devoir = Devoir::create($data);
        return $devoir->load(['matiere', 'enseignant.user']);
    }

    public function updateHomework(int $id, array $data): ?Devoir
    {
        $devoir = Devoir::find($id);
        if ($devoir) {
            $devoir->update($data);
            return $devoir->load(['matiere', 'enseignant.user']);
        }
        return null;
    }

    public function deleteHomework(int $id): bool
    {
        $devoir = Devoir::find($id);
        if ($devoir) {
            return (bool)$devoir->delete();
        }
        return false;
    }
}
