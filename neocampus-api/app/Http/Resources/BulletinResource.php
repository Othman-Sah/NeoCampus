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
            'periode' => $this->periode,
            'moyenne_generale' => $this->moyenne_generale,
            'date_generation' => $this->date_generation ? $this->date_generation->toDateString() : null,
            'etablissement_id' => $this->etablissement_id,
            'eleve' => $this->whenLoaded('eleve'),
        ];
    }
}
