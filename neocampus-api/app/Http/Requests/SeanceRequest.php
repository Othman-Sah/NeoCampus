<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SeanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jour' => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'classe_id' => 'required|integer|exists:classes,id',
            'enseignant_id' => 'required|integer|exists:enseignants,id',
            'matiere_id' => 'required|integer|exists:matieres,id',
        ];
    }
}
