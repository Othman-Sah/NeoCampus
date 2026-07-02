<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\BulletinPortInterface;
use App\Models\Bulletin;
use App\Models\Eleve;
use App\Models\Examen;
use App\Models\Note;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EloquentBulletinRepository implements BulletinPortInterface
{
    public function generateBulk(int $classeId, string $periode): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($classeId, $periode, $tenantId) {
            // Get all students in the class
            $students = Eleve::where('classe_id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->get();

            // Get all exam IDs for the class
            $examIds = Examen::where('classe_id', $classeId)
                ->where('etablissement_id', $tenantId)
                ->pluck('id')
                ->toArray();

            $results = [];

            foreach ($students as $student) {
                // Fetch student's grades for these exams
                $notes = Note::where('eleve_id', $student->id)
                    ->whereIn('examen_id', $examIds)
                    ->where('etablissement_id', $tenantId)
                    ->get();

                if ($notes->isEmpty()) {
                    continue; // Skip if student has no grades
                }

                $moyenne = $notes->avg('valeur');

                $bulletin = Bulletin::updateOrCreate(
                    [
                        'eleve_id' => $student->id,
                        'periode' => $periode,
                        'etablissement_id' => $tenantId,
                    ],
                    [
                        'moyenne_generale' => round($moyenne, 2),
                        'date_generation' => now()->toDateString(),
                    ]
                );

                $results[] = $bulletin->toArray();
            }

            return $results;
        });
    }
}
