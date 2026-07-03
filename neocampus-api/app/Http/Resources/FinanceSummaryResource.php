<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_encaisse' => (float) ($this['total_encaisse'] ?? 0.0),
            'soldes_impayes' => (float) ($this['soldes_impayes'] ?? 0.0),
            'paiements_aujourd_hui' => (int) ($this['paiements_aujourd_hui'] ?? 0),
            'masse_salariale' => (float) ($this['masse_salariale'] ?? 0.0),
            'period' => $this['period'] ?? '',
        ];
    }
}
