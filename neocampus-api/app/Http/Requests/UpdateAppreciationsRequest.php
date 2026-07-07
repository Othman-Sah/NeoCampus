<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppreciationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matiere_id' => 'required|integer|exists:matieres,id',
            'appreciation' => 'required|string|max:5000',
        ];
    }
}
