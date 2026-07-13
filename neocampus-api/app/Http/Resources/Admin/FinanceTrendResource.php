<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceTrendResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'month' => $this['month'] ?? '',
            'collected' => (float) ($this['collected'] ?? 0.0),
            'outstanding' => (float) ($this['outstanding'] ?? 0.0),
        ];
    }
}
