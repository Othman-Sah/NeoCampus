<?php

namespace App\Http\Resources\Library;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
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

        $bookData = $data['livre_details'] ?? [];
        $adherentData = $data['adherent_details'] ?? [];
        $userDetails = $adherentData['user_details'] ?? [];

        $fullName = trim(($userDetails['prenom'] ?? '') . ' ' . ($userDetails['nom'] ?? ''));
        if (empty($fullName)) {
            $fullName = 'Membre Inconnu';
        }

        $type = isset($adherentData['user_type']) ? class_basename($adherentData['user_type']) : 'Membre';
        if ($type === 'Eleve') {
            $type = 'Élève';
        } elseif ($type === 'Enseignant') {
            $type = 'Enseignant';
        }

        return [
            'id' => $data['id'] ?? null,
            'book' => new BookResource($bookData),
            'adherent' => [
                'id' => $adherentData['id'] ?? null,
                'full_name' => $fullName,
                'type' => $type,
            ],
            'date_emprunt' => $data['date_emprunt'] ?? '',
            'date_retour_prevue' => $data['date_retour_prevue'] ?? '',
            'date_retour_effective' => $data['date_retour_effective'] ?? null,
            'statut' => $data['statut'] ?? 'en_cours',
            'amende_payee' => (bool) ($data['amende_payee'] ?? false),
            'amende_annulee' => (bool) ($data['amende_annulee'] ?? false),
            'jours_retard' => $this->resource->jours_retard ?? $data['jours_retard'] ?? null,
            'amende' => $this->resource->amende ?? $data['amende'] ?? null,
        ];
    }
}
