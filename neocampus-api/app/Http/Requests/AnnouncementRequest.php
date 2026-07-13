<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'extrait' => 'nullable|string|max:500',
            'target_roles' => 'required|array',
            'target_roles.*' => 'string|in:admin,comptable,enseignant,bibliothecaire,parent,eleve,chauffeur,*',
            'is_pinned' => 'nullable|boolean',
            'published_at' => 'nullable|date_format:Y-m-d H:i:s',
        ];
    }
}
