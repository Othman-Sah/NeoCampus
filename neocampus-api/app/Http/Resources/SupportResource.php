<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'fichier_url' => $this->fichier_url,
            'type' => $this->type,
            'matiere_nom' => $this->matiere->nom ?? 'N/A',
            'enseignant_nom' => ($this->enseignant && $this->enseignant->user) ? ($this->enseignant->user->prenom . ' ' . $this->enseignant->user->nom) : 'N/A',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
