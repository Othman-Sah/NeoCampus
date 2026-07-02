<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\GradePortInterface;
use App\Models\Note;
use App\Models\DemandeExceptionNote;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EloquentGradeRepository implements GradePortInterface
{
    public function submitBulk(int $examenId, array $grades): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($examenId, $grades, $tenantId) {
            $results = [];
            foreach ($grades as $entry) {
                $note = Note::updateOrCreate(
                    [
                        'examen_id' => $examenId,
                        'eleve_id' => $entry['eleve_id'],
                        'etablissement_id' => $tenantId,
                    ],
                    [
                        'valeur' => $entry['valeur'],
                    ]
                );
                $results[] = $note;
            }

            // Update exam status to completed when grades are entered
            $exam = \App\Models\Examen::where('id', $examenId)
                ->where('etablissement_id', $tenantId)
                ->first();
            if ($exam) {
                $exam->update(['status' => 'completed']);
            }

            return $results;
        });
    }

    public function requestException(int $enseignantId, int $examenId, string $motif): object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $exception = DemandeExceptionNote::create([
            'enseignant_id' => $enseignantId,
            'examen_id' => $examenId,
            'motif' => $motif,
            'statut' => 'pending',
            'admin_id' => null,
            'etablissement_id' => $tenantId,
        ]);

        return $exception;
    }

    public function approveException(int $exceptionId, int $adminId): object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $exception = DemandeExceptionNote::where('id', $exceptionId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $exception->update([
            'statut' => 'approved',
            'admin_id' => $adminId,
        ]);

        return $exception;
    }

    public function hasActiveException(int $enseignantId, int $examenId): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return false;
        }

        return DemandeExceptionNote::where('enseignant_id', $enseignantId)
            ->where('examen_id', $examenId)
            ->where('statut', 'approved')
            ->where('etablissement_id', $tenantId)
            ->exists();
    }

    public function getPendingExceptions(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        return DemandeExceptionNote::with(['enseignant.user', 'examen.classe', 'examen.matiere'])
            ->where('statut', 'pending')
            ->where('etablissement_id', $tenantId)
            ->get()
            ->all();
    }

    public function findByExamen(int $examenId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        return Note::where('examen_id', $examenId)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->all();
    }
}
