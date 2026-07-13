<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) 
            ? $this->resource 
            : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        return [
            'id' => $data['id'],
            'matricule' => $data['matricule'],
            'marque' => $data['marque'],
            'modele' => $data['modele'] ?? null,
            'capacite' => (int)$data['capacite'],
            'statut' => $data['statut'] ?? 'actif',
            'annee_mise_en_service' => isset($data['annee_mise_en_service']) ? (int)$data['annee_mise_en_service'] : null,
            'driver_count' => $data['chauffeurs_count'] ?? count($data['chauffeurs'] ?? []),
            'route_count' => $data['itineraires_count'] ?? count($data['itineraires'] ?? []),
            'created_at' => $data['created_at'] ?? null,
        ];
    }
}
