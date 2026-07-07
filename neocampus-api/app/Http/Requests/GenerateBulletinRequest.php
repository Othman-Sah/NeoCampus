<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateBulletinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'classe_id' => 'required|integer|exists:classes,id',
            'periode' => 'required|string|max:255',
            'annee_scolaire' => 'required|string|max:255',
        ];
    }
}
