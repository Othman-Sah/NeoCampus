<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProposeExamScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'intitule' => 'required|string|max:255',
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'required|integer|exists:matieres,id',
            'date_proposee' => 'required|date',
        ];
    }
}
