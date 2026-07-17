<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Middleware role:admin handles route authorization
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $id = $this->route('elefe') ?? $this->route('eleve'); // Support Laravel singularization 'elefe' and fallback 'eleve'

        return [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . ($id ? $this->getUserIdFromStudent($id) : 'NULL') . ',id',
            'password' => ['nullable', 'string', \Illuminate\Validation\Rules\Password::min(8)->mixedCase()->numbers()],
            'matricule' => 'nullable|string|max:100',
            'classe_id' => 'nullable|integer',
            'classe_nom' => 'nullable|string|max:255',
            'sexe' => 'nullable|string|in:Male,Female,Other',
            'date_naissance' => 'nullable|date',
            'status' => 'nullable|string|in:Active,Suspended',
            'parent_contact' => 'nullable|array',
            'parent_contact.nom' => 'nullable|string|max:255',
            'parent_contact.relation' => 'nullable|string|max:255',
            'parent_contact.telephone' => 'nullable|string|max:255',
            'parent_contact.email' => 'nullable|email|max:255',
            'documents' => 'nullable|array',
            'scolarite_anterieure' => 'nullable|string',
        ];
    }

    private function getUserIdFromStudent(?string $studentId): ?int
    {
        if (!$studentId) {
            return null;
        }
        $eleve = \App\Models\Eleve::find((int) $studentId);
        return $eleve ? $eleve->user_id : null;
    }
}
