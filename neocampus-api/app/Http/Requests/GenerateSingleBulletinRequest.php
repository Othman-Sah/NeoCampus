<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateSingleBulletinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'eleve_id' => 'required|integer|exists:eleves,id',
            'periode' => 'required|string|max:255',
            'annee_scolaire' => 'required|string|max:255',
        ];
    }
}
