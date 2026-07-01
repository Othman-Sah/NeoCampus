<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'enseignant_id' => 'required|integer|exists:enseignants,id',
            'mois' => 'required|string|regex:/^\d{4}-\d{2}$/', // e.g. "2026-06"
            'salaire_de_base' => 'nullable|numeric|min:0',
            'primes' => 'nullable|numeric|min:0',
            'indemnites' => 'nullable|numeric|min:0',
            'retenues' => 'nullable|numeric|min:0',
            'statut' => 'nullable|string|in:Draft,Paid',
            'date_paiement' => 'nullable|date',
            'notes' => 'nullable|string',
        ];

        // Ensure uniqueness on creation (POST)
        if ($this->isMethod('post')) {
            $rules['enseignant_id'] = [
                'required',
                'integer',
                'exists:enseignants,id',
                Rule::unique('enseignant_salaires')
                    ->where('etablissement_id', $this->user()->etablissement_id ?? 1)
                    ->where('mois', $this->input('mois'))
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'enseignant_id.unique' => 'A payslip for this teacher and month already exists.',
        ];
    }
}
