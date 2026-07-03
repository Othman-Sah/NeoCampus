<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecetteDepenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'libelle' => 'required|string|max:200',
            'montant' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:recette,depense',
            'categorie' => 'nullable|string|max:100',
            'date' => 'required|date',
            'justificatif' => 'nullable|string|max:255',
        ];
    }
}
