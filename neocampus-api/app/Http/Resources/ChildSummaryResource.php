<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChildSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->eleve_id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'matricule' => $this->matricule,
            'classe_nom' => $this->classe_nom,
            'avatar' => $this->avatar,
            'relation' => $this->relation,
            'latest_grade' => $this->latest_grade,
            'absence_count_week' => $this->absence_count_this_week,
            'next_payment' => $this->next_payment_due,
            'overall_average' => $this->overall_average,
        ];
    }
}
