<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandeExceptionNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'enseignant_id' => $this->enseignant_id,
            'examen_id' => $this->examen_id,
            'motif' => $this->motif,
            'statut' => $this->statut,
            'admin_id' => $this->admin_id,
            'etablissement_id' => $this->etablissement_id,
            'enseignant' => $this->whenLoaded('enseignant'),
            'examen' => $this->whenLoaded('examen'),
        ];
    }
}
