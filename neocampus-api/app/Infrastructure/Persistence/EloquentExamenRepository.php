<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\ExamenPortInterface;
use App\Models\Examen;
use App\Models\ParametresExamen;
use App\Models\DemandePlannificationExamen;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EloquentExamenRepository implements ExamenPortInterface
{
    public function proposeSchedule(int $enseignantId, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($enseignantId, $data, $tenantId) {
            // 1. Create a draft exam
            $examen = Examen::create([
                'intitule' => $data['intitule'],
                'classe_id' => $data['classe_id'],
                'matiere_id' => $data['matiere_id'],
                'status' => 'draft',
                'etablissement_id' => $tenantId,
            ]);

            // 2. Create the schedule request
            $proposal = DemandePlannificationExamen::create([
                'enseignant_id' => $enseignantId,
                'examen_id' => $examen->id,
                'date_proposee' => $data['date_proposee'],
                'statut' => 'pending',
                'commentaire_admin' => null,
                'etablissement_id' => $tenantId,
            ]);

            return [
                'examen' => $examen,
                'proposal' => $proposal,
            ];
        });
    }

    public function reviewSchedule(int $proposalId, string $status, ?string $comment, ?int $adminId): object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        return DB::transaction(function () use ($proposalId, $status, $comment, $adminId, $tenantId) {
            $proposal = DemandePlannificationExamen::where('id', $proposalId)
                ->where('etablissement_id', $tenantId)
                ->firstOrFail();

            $proposal->update([
                'statut' => $status,
                'commentaire_admin' => $comment,
            ]);

            // If approved, update exam status and date
            $exam = Examen::where('id', $proposal->examen_id)
                ->where('etablissement_id', $tenantId)
                ->firstOrFail();

            if ($status === 'approved') {
                $exam->update([
                    'status' => 'approved',
                    'date' => $proposal->date_proposee,
                ]);
            } else if ($status === 'rejected') {
                $exam->update([
                    'status' => 'rejected',
                ]);
            }

            return $proposal;
        });
    }

    public function uploadSujet(int $examenId, string $path): object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $exam = Examen::where('id', $examenId)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $exam->update([
            'fichier_sujet' => $path,
        ]);

        return $exam;
    }

    public function findSettings(): ?object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return null;
        }

        return ParametresExamen::where('etablissement_id', $tenantId)->first();
    }

    public function updateSettings(array $data): object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $settings = ParametresExamen::updateOrCreate(
            ['etablissement_id' => $tenantId],
            [
                'periode_saisie_notes_debut' => $data['periode_saisie_notes_debut'],
                'periode_saisie_notes_fin' => $data['periode_saisie_notes_fin'],
                'force_admin_schedule' => (bool)$data['force_admin_schedule'],
                'require_sujet_upload' => (bool)$data['require_sujet_upload'],
                'template_sujet_path' => $data['template_sujet_path'] ?? null,
            ]
        );

        return $settings;
    }

    public function findById(int $id): ?object
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return null;
        }

        return Examen::with(['classe', 'matiere'])
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();
    }

    public function getPendingProposals(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        return DemandePlannificationExamen::with(['enseignant.user', 'examen.classe', 'examen.matiere'])
            ->where('statut', 'pending')
            ->where('etablissement_id', $tenantId)
            ->get()
            ->all();
    }

    public function getTeacherExams(int $enseignantId): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            return [];
        }

        // Get exams corresponding to teacher's assigned classes/subjects
        $teacher = \App\Models\Enseignant::find($enseignantId);
        if (!$teacher) {
            return [];
        }

        $classIds = $teacher->classes()->pluck('classes.id')->toArray();
        $subjectIds = $teacher->matieres()->pluck('matieres.id')->toArray();

        return Examen::with(['classe', 'matiere'])
            ->whereIn('classe_id', $classIds)
            ->whereIn('matiere_id', $subjectIds)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->all();
    }
}
