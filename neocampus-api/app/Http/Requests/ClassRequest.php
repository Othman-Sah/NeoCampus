<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'niveau' => 'nullable|string|max:255',
            'section_id' => 'required|integer|exists:sections,id',
            'annee_scolaire_id' => 'required|integer|exists:annees_scolaires,id',
        ];
    }
}
