<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkGradesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'examen_id' => 'required|integer|exists:examens,id',
            'notes' => 'required|array',
            'notes.*.eleve_id' => 'required|integer|exists:eleves,id',
            'notes.*.valeur' => 'required|numeric|min:0|max:20',
        ];
    }
}
