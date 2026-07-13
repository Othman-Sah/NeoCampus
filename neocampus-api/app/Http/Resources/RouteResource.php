<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RouteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) 
            ? $this->resource 
            : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        $students = $data['students'] ?? [];
        if (empty($students) && !$is_array = is_array($this->resource) && $this->relationLoaded('eleves')) {
            foreach ($this->eleves as $eleve) {
                $students[] = [
                    'eleve_id' => $eleve->id,
                    'nom' => $eleve->nom,
                    'prenom' => $eleve->prenom,
                    'classe_nom' => $eleve->classe->nom ?? $eleve->classe_nom ?? 'N/A',
                    'point_ramassage' => $eleve->pivot->point_ramassage ?? null,
                    'latitude' => $eleve->pivot->latitude ? (float)$eleve->pivot->latitude : null,
                    'longitude' => $eleve->pivot->longitude ? (float)$eleve->pivot->longitude : null,
                ];
            }
        }

        return [
            'id' => $data['id'],
            'nom' => $data['nom'],
            'zone' => $data['zone'],
            'description' => $data['description'] ?? null,
            'vehicule_id' => $data['vehicule_id'] ?? null,
            'heure_depart' => $data['heure_depart'] ?? null,
            'heure_retour' => $data['heure_retour'] ?? null,
            'statut' => $data['statut'] ?? 'actif',
            'student_count' => $data['student_count'] ?? count($students),
            'students' => $students,
            'vehicule' => $data['vehicule'] ?? null,
            'created_at' => $data['created_at'] ?? null,
        ];
    }
}
