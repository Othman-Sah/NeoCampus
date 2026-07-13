<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChildGradeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'matiere' => $this->matiere_nom,
            'examen' => $this->examen_intitule,
            'valeur' => $this->valeur,
            'date' => $this->date,
            'coefficient' => $this->coefficient,
            'classe_average' => $this->classe_average,
        ];
    }
}
