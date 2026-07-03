<?php

namespace App\Http\Resources\Library;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Handle both domain model objects and arrays
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        return [
            'id' => $tableId = $data['id'] ?? null,
            'titre' => $data['titre'] ?? '',
            'auteur' => $data['auteur'] ?? '',
            'isbn' => $data['isbn'] ?? '',
            'genre' => $data['genre'] ?? null,
            'quantite_stock' => (int) ($data['quantite_stock'] ?? 0),
            'disponible' => (int) ($data['quantite_stock'] ?? 0) > 0,
        ];
    }
}
