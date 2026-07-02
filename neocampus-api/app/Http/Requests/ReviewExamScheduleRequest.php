<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewExamScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'statut' => 'required|string|in:approved,rejected',
            'commentaire_admin' => 'required_if:statut,rejected|nullable|string',
        ];
    }
}
