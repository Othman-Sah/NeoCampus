<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignStudentsToRouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignments' => 'required|array',
            'assignments.*.eleve_id' => 'required|integer|exists:eleves,id',
            'assignments.*.point_ramassage' => 'nullable|string|max:200',
            'assignments.*.latitude' => 'nullable|numeric|between:-90,90',
            'assignments.*.longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}
