<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:150',
            'zone' => 'required|string|max:150',
            'description' => 'nullable|string',
            'vehicule_id' => 'nullable|integer|exists:vehicules,id',
            'heure_depart' => 'nullable|date_format:H:i',
            'heure_retour' => 'nullable|date_format:H:i',
            'statut' => 'nullable|string|in:actif,inactif',
        ];
    }
}
