<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) 
            ? $this->resource 
            : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        return [
            'id' => $data['id'],
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'telephone' => $data['telephone'] ?? null,
            'num_permis' => $data['num_permis'],
            'vehicule_id' => $data['vehicule_id'] ?? null,
            'user_id' => $data['user_id'] ?? null,
            'statut' => $data['statut'] ?? 'actif',
            'created_at' => $data['created_at'] ?? null,
            'vehicule' => $data['vehicule'] ?? null,
            'user' => isset($data['user']) ? [
                'id' => $data['user']['id'],
                'nom' => $data['user']['nom'],
                'prenom' => $data['user']['prenom'],
                'email' => $data['user']['email'],
                'avatar' => $data['user']['avatar'] ?? null,
            ] : null,
        ];
    }
}
