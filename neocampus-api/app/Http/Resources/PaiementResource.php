<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'] ?? null,
            'frais_id' => $this['frais_id'] ?? null,
            'montant_paye' => (float) ($this['montant_paye'] ?? 0.0),
            'date_paiement' => $this['date_paiement'] ?? null,
            'mode' => $this['mode'] ?? null,
            'reference' => $this['reference'] ?? null,
            'comptable_id' => $this['comptable_id'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'comptable' => isset($this['comptable']) && $this['comptable'] ? [
                'id' => $this['comptable']['id'],
                'nom' => $this['comptable']['nom'],
                'prenom' => $this['comptable']['prenom'],
            ] : null,
            'frais' => $this['frais'] ?? null,
            'created_at' => $this['created_at'] ?? null,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
