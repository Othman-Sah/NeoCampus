<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type_frais_ids' => 'required|array',
            'type_frais_ids.*' => 'required|integer|exists:type_frais,id',
            'eleve_id' => 'nullable|integer|exists:eleves,id',
            'classe_id' => 'nullable|integer|exists:classes,id',
            'date_echeance' => 'required|date|after_or_equal:today',
            'annee_scolaire' => 'nullable|string|regex:/^\d{4}-\d{4}$/',
        ];
    }
}
