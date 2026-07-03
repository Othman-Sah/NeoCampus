<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FraisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $baseMontant = (float) ($this['montant'] ?? 0.0);
        
        $remiseTotal = 0.0;
        foreach ($this['remises'] ?? [] as $r) {
            $remiseTotal += $baseMontant * ((float) $r['pourcentage'] / 100);
        }

        $penaliteTotal = 0.0;
        foreach ($this['penalites'] ?? [] as $p) {
            $penaliteTotal += (float) $p['montant'];
        }

        $netAmount = $baseMontant - $remiseTotal + $penaliteTotal;

        $paidTotal = 0.0;
        foreach ($this['paiements'] ?? [] as $pay) {
            $paidTotal += (float) $pay['montant_paye'];
        }

        $remaining = $netAmount - $paidTotal;
        if ($remaining < 0) {
            $remaining = 0.0;
        }

        return [
            'id' => $this['id'] ?? null,
            'type_frais_id' => $this['type_frais_id'] ?? null,
            'eleve_id' => $this['eleve_id'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'montant' => $baseMontant,
            'date_echeance' => $this['date_echeance'] ?? null,
            'statut' => $this['statut'] ?? null,
            'annee_scolaire' => $this['annee_scolaire'] ?? null,
            'type_frais' => $this['type_frais'] ?? null,
            'eleve' => $this['eleve'] ?? null,
            'remises' => $this['remises'] ?? [],
            'penalites' => $this['penalites'] ?? [],
            'paiements' => $this['paiements'] ?? [],
            'net_amount' => $netAmount,
            'montant_restant' => $remaining,
            'created_at' => $this['created_at'] ?? null,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
