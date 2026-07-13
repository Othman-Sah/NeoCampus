<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDevoirRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'required|integer|exists:matieres,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_echeance' => 'required|date|after_or_equal:today',
            'fichier_url' => 'nullable|string|max:500',
        ];
    }
}
