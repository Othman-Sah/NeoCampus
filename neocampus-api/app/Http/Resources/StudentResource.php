<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this is the StudentOutputDTO or the Eloquent model/array
        $data = is_array($this->resource) ? $this->resource : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        return [
            'id' => $data['id'],
            'etablissement_id' => $data['etablissement_id'],
            'user_id' => $data['user_id'] ?? null,
            'matricule' => $data['matricule'],
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'] ?? null,
            'sexe' => $data['sexe'] ?? null,
            'date_naissance' => $data['date_naissance'] ?? null,
            'classe_id' => $data['classe_id'] ?? null,
            'classe_nom' => $data['classe_nom'] ?? $this->getMockClasseNom($data['classe_id'] ?? null),
            'status' => $data['status'] ?? 'Actif',
            'parent_contact' => $data['parent_contact'] ?? null,
            'documents' => $data['documents'] ?? null,
            'scolarite_anterieure' => $data['scolarite_anterieure'] ?? null,
            'avatar' => $data['user']['avatar'] ?? $data['avatar'] ?? null,
        ];
    }

    private function getMockClasseNom(?int $classeId): ?string
    {
        if (!$classeId) return null;
        $classes = [
            1 => '6ème A',
            2 => '5ème B',
            3 => '3ème A',
            4 => '6ème C',
            5 => 'CM2 A',
        ];
        return $classes[$classeId] ?? 'Classe ' . $classeId;
    }
}
