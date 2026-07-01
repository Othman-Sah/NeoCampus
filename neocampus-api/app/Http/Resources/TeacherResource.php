<?php

namespace App\Http\Resources;

use App\Domain\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof Teacher) {
            return $this->resource->toArray();
        }

        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'id' => $data['id'],
            'user_id' => $data['user_id'] ?? null,
            'specialite' => $data['specialite'],
            'salaire_de_base' => (float)($data['salaire_de_base'] ?? 0.00),
            'etablissement_id' => $data['etablissement_id'],
            'user' => $data['user'] ?? null,
            'classes' => $data['classes'] ?? [],
        ];
    }
}
