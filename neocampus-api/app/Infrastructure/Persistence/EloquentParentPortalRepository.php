<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\ParentPortalPortInterface;
use App\Models\User;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Presence;
use App\Models\Seance;
use App\Models\Solde;
use App\Models\Frais;
use App\Models\Paiement;
use App\Models\Bulletin;
use Illuminate\Support\Facades\DB;

class EloquentParentPortalRepository implements ParentPortalPortInterface
{
    public function verifyParentChildLink(int $parentUserId, int $eleveId): bool
    {
        return DB::table('parent_eleve')
            ->where('parent_user_id', $parentUserId)
            ->where('eleve_id', $eleveId)
            ->exists();
    }

    public function getChildren(int $parentUserId): array
    {
        $user = User::find($parentUserId);
        if (!$user) {
            return [];
        }
        return $user->children()->with('classe')->get()->all();
    }

    public function getChildGrades(int $parentUserId, int $eleveId): array
    {
        $notes = Note::where('eleve_id', $eleveId)
            ->with(['examen.matiere'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedGrades = [];
        foreach ($notes as $note) {
            if (!$note->examen) {
                continue;
            }
            $examenId = $note->examen_id;
            $classAvg = Note::where('examen_id', $examenId)->avg('valeur');

            $formattedGrades[] = [
                'matiere_nom' => $note->examen->matiere->nom ?? 'N/A',
                'examen_intitule' => $note->examen->intitule ?? 'N/A',
                'valeur' => $note->valeur,
                'date' => $note->examen->date ? $note->examen->date->toDateString() : '',
                'coefficient' => (float)($note->examen->poids ?? 1.0),
                'classe_average' => $classAvg ? round((float)$classAvg, 2) : null,
            ];
        }

        return $formattedGrades;
    }

    public function getChildAttendance(int $parentUserId, int $eleveId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = Presence::where('eleve_id', $eleveId)
            ->with(['seance.matiere']);

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        $presences = $query->orderBy('date', 'desc')->get();
        $formatted = [];
        foreach ($presences as $p) {
            $formatted[] = [
                'date' => $p->date,
                'statut' => $p->statut,
                'motif' => $p->motif,
                'justifie' => (bool)$p->justifie,
                'matiere_nom' => $p->seance->matiere->nom ?? 'N/A',
                'heure' => $p->seance ? ($p->seance->heure_debut . ' - ' . $p->seance->heure_fin) : 'N/A',
            ];
        }

        return $formatted;
    }

    public function getChildTimetable(int $parentUserId, int $eleveId): array
    {
        $student = Eleve::find($eleveId);
        if (!$student || !$student->classe_id) {
            return [];
        }

        return Seance::where('classe_id', $student->classe_id)
            ->with(['matiere', 'enseignant.user'])
            ->get()
            ->all();
    }

    public function getChildBalance(int $parentUserId, int $eleveId): array
    {
        $solde = Solde::where('eleve_id', $eleveId)->first();
        $frais = Frais::where('eleve_id', $eleveId)
            ->with('typeFrais')
            ->orderBy('date_echeance', 'asc')
            ->get()
            ->all();

        $fraisIds = collect($frais)->pluck('id')->toArray();
        $recentPayments = [];
        if (!empty($fraisIds)) {
            $recentPayments = Paiement::whereIn('frais_id', $fraisIds)
                ->orderBy('date_paiement', 'desc')
                ->get()
                ->all();
        }

        return [
            'solde' => $solde,
            'frais' => $frais,
            'recent_payments' => $recentPayments,
        ];
    }

    public function getChildBulletins(int $parentUserId, int $eleveId): array
    {
        return Bulletin::where('eleve_id', $eleveId)
            ->where('status', 'PUBLISHED')
            ->with(['eleve', 'classe', 'details.matiere', 'details.prof.user', 'etablissement'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    public function getChildSummary(int $parentUserId, int $eleveId): array
    {
        $student = Eleve::with('classe')->find($eleveId);
        if (!$student) {
            return [];
        }

        // 1. Latest grade
        $latestNote = Note::where('eleve_id', $eleveId)
            ->with(['examen.matiere'])
            ->orderBy('created_at', 'desc')
            ->first();

        $latestGradeData = null;
        if ($latestNote && $latestNote->examen) {
            $latestGradeData = [
                'matiere' => $latestNote->examen->matiere->nom ?? 'N/A',
                'valeur' => $latestNote->valeur,
                'date' => $latestNote->examen->date ? $latestNote->examen->date->toDateString() : '',
            ];
        }

        // 2. Absence count this week
        $startOfWeek = now()->startOfWeek()->toDateString();
        $endOfWeek = now()->endOfWeek()->toDateString();
        $absenceCount = Presence::where('eleve_id', $eleveId)
            ->where('statut', 'absent')
            ->whereBetween('date', [$startOfWeek, $endOfWeek])
            ->count();

        // 3. Next payment due
        $nextFrais = Frais::where('eleve_id', $eleveId)
            ->where('statut', 'unpaid')
            ->where('date_echeance', '>=', now()->toDateString())
            ->orderBy('date_echeance', 'asc')
            ->first();

        $nextPaymentData = null;
        if ($nextFrais) {
            $nextPaymentData = [
                'montant' => (float)$nextFrais->montant,
                'date_echeance' => $nextFrais->date_echeance,
            ];
        }

        // 4. Overall average
        $notes = Note::where('eleve_id', $eleveId)->get();
        $average = $notes->isNotEmpty() ? $notes->avg('valeur') : null;

        // 5. Relation
        $relation = DB::table('parent_eleve')
            ->where('parent_user_id', $parentUserId)
            ->where('eleve_id', $eleveId)
            ->value('relation');

        return [
            'eleve_id' => $student->id,
            'nom' => $student->nom,
            'prenom' => $student->prenom,
            'classe_nom' => $student->classe->nom ?? 'N/A',
            'matricule' => $student->matricule,
            'avatar' => $student->user->avatar ?? null,
            'relation' => $relation,
            'latest_grade' => $latestGradeData,
            'absence_count_this_week' => $absenceCount,
            'next_payment_due' => $nextPaymentData,
            'overall_average' => $average,
        ];
    }
}
