<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyRemiseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pourcentage' => 'required|numeric|between:0,100',
            'motif' => 'nullable|string|max:1000',
        ];
    }
}
