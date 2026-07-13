<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'num_permis' => 'required|string|max:50',
            'vehicule_id' => 'nullable|integer|exists:vehicules,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'statut' => 'nullable|string|in:actif,inactif',
        ];
    }
}
