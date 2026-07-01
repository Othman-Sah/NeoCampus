<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'id' => $data['id'],
            'enseignant_id' => $data['enseignant_id'],
            'etablissement_id' => $data['etablissement_id'],
            'mois' => $data['mois'],
            'salaire_de_base' => (float)$data['salaire_de_base'],
            'primes' => (float)$data['primes'],
            'indemnites' => (float)$data['indemnites'],
            'retenues' => (float)$data['retenues'],
            'salaire_net' => (float)$data['salaire_net'],
            'statut' => $data['statut'],
            'date_paiement' => $data['date_paiement'] ? \Carbon\Carbon::parse($data['date_paiement'])->format('Y-m-d') : null,
            'notes' => $data['notes'] ?? null,
            'enseignant' => $data['enseignant'] ?? null,
        ];
    }
}
