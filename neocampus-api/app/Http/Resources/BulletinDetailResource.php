<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BulletinDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bulletin_id' => $this->bulletin_id,
            'matiere_id' => $this->matiere_id,
            'prof_id' => $this->prof_id,
            'coefficient' => (float) $this->coefficient,
            'moyenne_eleve' => $this->moyenne_eleve !== null ? (float) $this->moyenne_eleve : null,
            'moyenne_min' => $this->moyenne_min !== null ? (float) $this->moyenne_min : null,
            'moyenne_max' => $this->moyenne_max !== null ? (float) $this->moyenne_max : null,
            'moyenne_classe_matiere' => $this->moyenne_classe_matiere !== null ? (float) $this->moyenne_classe_matiere : null,
            'rang_matiere' => $this->rang_matiere,
            'appreciation_prof' => $this->appreciation_prof,
            'notes_detail' => $this->notes_detail,
            'sous_total_pondere' => $this->sous_total_pondere !== null ? (float) $this->sous_total_pondere : null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,

            // Nested
            'matiere' => $this->whenLoaded('matiere'),
            'prof' => new TeacherResource($this->whenLoaded('prof')),
        ];
    }
}
