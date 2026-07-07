<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BulletinResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'eleve_id' => $this->eleve_id,
            'classe_id' => $this->classe_id,
            'annee_scolaire' => $this->annee_scolaire,
            'periode' => $this->periode,
            'moyenne_generale' => $this->moyenne_generale !== null ? (float) $this->moyenne_generale : null,
            'moyenne_classe' => $this->moyenne_classe !== null ? (float) $this->moyenne_classe : null,
            'rang_classe' => $this->rang_classe,
            'total_absences' => $this->total_absences,
            'appreciation_generale' => $this->appreciation_generale,
            'status' => $this->status,
            'etablissement_id' => $this->etablissement_id,
            'decision_conseil' => $this->decision_conseil,
            'mention' => $this->mention,
            'validated_by' => $this->validated_by,
            'validated_at' => $this->validated_at ? ($this->validated_at instanceof \DateTime ? $this->validated_at->format(\DateTime::ATOM) : $this->validated_at) : null,
            'published_at' => $this->published_at ? ($this->published_at instanceof \DateTime ? $this->published_at->format(\DateTime::ATOM) : $this->published_at) : null,
            'absences_justifiees' => $this->absences_justifiees,
            'absences_injustifiees' => $this->absences_injustifiees,
            'retards' => $this->retards,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
            
            // Nested relations
            'eleve' => new StudentResource($this->whenLoaded('eleve')),
            'classe' => new ClassResource($this->whenLoaded('classe')),
            'details' => BulletinDetailResource::collection($this->whenLoaded('details')),
            'etablissement' => new EtablissementResource($this->whenLoaded('etablissement')),
        ];
    }
}
