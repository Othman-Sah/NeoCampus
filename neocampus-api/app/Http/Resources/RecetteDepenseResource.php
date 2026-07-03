<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecetteDepenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'] ?? null,
            'libelle' => $this['libelle'] ?? '',
            'montant' => (float) ($this['montant'] ?? 0.0),
            'type' => $this['type'] ?? '',
            'categorie' => $this['categorie'] ?? null,
            'date' => $this['date'] ?? null,
            'justificatif' => $this['justificatif'] ?? null,
            'saisie_par' => $this['saisie_par'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'saisie_par_user' => $this['saisie_par_user'] ?? null,
            'created_at' => $this['created_at'] ?? null,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
