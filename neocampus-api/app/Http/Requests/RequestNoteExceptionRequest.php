<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestNoteExceptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'examen_id' => 'required|integer|exists:examens,id',
            'motif' => 'required|string|min:5',
        ];
    }
}
