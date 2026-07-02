<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandePlannificationExamenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'enseignant_id' => $this->enseignant_id,
            'examen_id' => $this->examen_id,
            'date_proposee' => $this->date_proposee ? $this->date_proposee->toIso8601String() : null,
            'statut' => $this->statut,
            'commentaire_admin' => $this->commentaire_admin,
            'etablissement_id' => $this->etablissement_id,
            'enseignant' => $this->whenLoaded('enseignant'),
            'examen' => $this->whenLoaded('examen'),
        ];
    }
}
