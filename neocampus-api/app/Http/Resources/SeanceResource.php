<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'id' => $data['id'],
            'jour' => $data['jour'],
            'heure_debut' => $data['heure_debut'],
            'heure_fin' => $data['heure_fin'],
            'classe_id' => $data['classe_id'],
            'classe_nom' => $data['classe_nom'] ?? null,
            'enseignant_id' => $data['enseignant_id'],
            'enseignant_nom' => $data['enseignant_nom'] ?? null,
            'matiere_id' => $data['matiere_id'],
            'matiere_nom' => $data['matiere_nom'] ?? null,
            'matiere_intitule' => $data['matiere_intitule'] ?? ($data['matiere_nom'] ?? null),
            'etablissement_id' => $data['etablissement_id'],
        ];
    }
}
