<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SoldeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $montantDu = (float) ($this['montant_du'] ?? 0.0);
        $montantPaye = (float) ($this['montant_paye'] ?? 0.0);
        $montantRestant = (float) ($this['montant_restant'] ?? ($montantDu - $montantPaye));
        if ($montantRestant < 0) {
            $montantRestant = 0.0;
        }

        $statut = 'paye';
        if ($montantRestant > 0) {
            $statut = 'en_attente';
            if (isset($this['has_late_fees']) && $this['has_late_fees']) {
                $statut = 'en_retard';
            }
        }

        return [
            'id' => $this['id'] ?? null,
            'eleve_id' => $this['eleve_id'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'montant_du' => $montantDu,
            'montant_paye' => $montantPaye,
            'montant_restant' => $montantRestant,
            'statut' => $statut,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
