<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required_without:id|string|max:255',
            'prenom' => 'required_without:id|string|max:255',
            'email' => 'required_without:id|email|max:255',
            'password' => 'nullable|string|min:6',
            'specialite' => 'required|string|max:255',
            'salaire_de_base' => 'nullable|numeric|min:0',
            'avatar' => 'nullable|string',
            'classes' => 'nullable|array',
            'classes.*' => 'nullable', // can be numeric class_id or associative array
        ];
    }
}
