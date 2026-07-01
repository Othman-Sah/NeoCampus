<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'id' => $data['id'],
            'nom' => $data['nom'],
            'niveau' => $data['niveau'] ?? null,
            'section_id' => $data['section_id'],
            'annee_scolaire_id' => $data['annee_scolaire_id'],
            'etablissement_id' => $data['etablissement_id'],
            'students_count' => $data['students_count'] ?? 0,
            'teachers_count' => $data['teachers_count'] ?? 0,
        ];
    }
}
