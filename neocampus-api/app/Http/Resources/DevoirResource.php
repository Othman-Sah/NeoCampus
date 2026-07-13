<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class DevoirResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $dueDate = Carbon::parse($this->date_echeance);
        $daysRemaining = now()->startOfDay()->diffInDays($dueDate, false);
        $isOverdue = $daysRemaining < 0;

        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'date_echeance' => $dueDate->toDateString(),
            'fichier_url' => $this->fichier_url,
            'matiere_nom' => $this->matiere->nom ?? 'N/A',
            'enseignant_nom' => ($this->enseignant && $this->enseignant->user) ? ($this->enseignant->user->prenom . ' ' . $this->enseignant->user->nom) : 'N/A',
            'is_overdue' => $isOverdue,
            'days_remaining' => (int)$daysRemaining,
        ];
    }
}
