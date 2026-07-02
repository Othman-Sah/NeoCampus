<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date ? $this->date->toIso8601String() : null,
            'intitule' => $this->intitule,
            'classe_id' => $this->classe_id,
            'matiere_id' => $this->matiere_id,
            'status' => $this->status,
            'fichier_sujet' => $this->fichier_sujet,
            'etablissement_id' => $this->etablissement_id,
            'classe' => $this->whenLoaded('classe'),
            'matiere' => $this->whenLoaded('matiere'),
        ];
    }
}
