<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'frais_id' => 'required|integer|exists:frais,id',
            'montant_paye' => 'required|numeric|min:0.01',
            'date_paiement' => 'required|date|before_or_equal:today',
            'mode' => 'required|string|in:cash,virement,cheque',
            'reference' => 'nullable|string|max:100',
        ];
    }
}
