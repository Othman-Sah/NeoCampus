<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'seance_id' => $this->seance_id,
            'eleve_id' => $this->eleve_id,
            'statut' => $this->statut,
            'motif' => $this->motif,
            'date' => $this->date,
            'etablissement_id' => $this->etablissement_id,
            'seance' => $this->whenLoaded('seance'),
            'eleve' => $this->relationLoaded('eleve') && $this->eleve ? new StudentResource($this->eleve) : null,
        ];
    }
}
