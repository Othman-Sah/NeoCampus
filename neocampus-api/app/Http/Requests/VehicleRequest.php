<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricule' => 'required|string|max:20',
            'marque' => 'required|string|max:100',
            'modele' => 'nullable|string|max:100',
            'capacite' => 'required|integer|min:1',
            'statut' => 'nullable|string|in:actif,maintenance,hors_service',
            'annee_mise_en_service' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ];
    }
}
