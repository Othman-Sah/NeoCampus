<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChildAttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $parts = explode(' - ', $this->heure);
        $heureDebut = $parts[0] ?? 'N/A';
        $heureFin = $parts[1] ?? 'N/A';

        return [
            'date' => $this->date,
            'statut' => $this->statut,
            'motif' => $this->motif,
            'justifie' => $this->justifie,
            'matiere_nom' => $this->matiere_nom,
            'heure' => $this->heure,
            'heure_debut' => $heureDebut,
            'heure_fin' => $heureFin,
        ];
    }
}
