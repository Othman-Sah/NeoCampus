<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'valeur' => $this->valeur,
            'examen_id' => $this->examen_id,
            'eleve_id' => $this->eleve_id,
            'etablissement_id' => $this->etablissement_id,
            'examen' => $this->whenLoaded('examen'),
            'eleve' => $this->whenLoaded('eleve'),
        ];
    }
}
