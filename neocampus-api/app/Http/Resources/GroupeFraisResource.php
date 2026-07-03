<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupeFraisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'] ?? null,
            'nom' => $this['nom'] ?? '',
            'description' => $this['description'] ?? null,
            'etablissement_id' => $this['etablissement_id'] ?? null,
            'created_at' => $this['created_at'] ?? null,
            'updated_at' => $this['updated_at'] ?? null,
        ];
    }
}
