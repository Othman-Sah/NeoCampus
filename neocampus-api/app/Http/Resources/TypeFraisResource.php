<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TypeFraisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'] ?? null,
            'libelle' => $this['libelle'] ?? '',
            'groupe_frais_id' => $this['groupe_frais_id'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'montant_par_defaut' => (float) ($this['montant_par_defaut'] ?? 0.0),
            'groupe' => $this['groupe'] ?? null,
            'created_at' => $this['created_at'] ?? null,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
