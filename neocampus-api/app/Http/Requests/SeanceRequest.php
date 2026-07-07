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
            'matiere_id' => [
                'required',
                'integer',
                'exists:matieres,id',
                function ($attribute, $value, $fail) {
                    $classeId = $this->input('classe_id');
                    $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id ?? null;
                    
                    if ($classeId && $tenantId) {
                        $exists = \Illuminate\Support\Facades\DB::table('classe_matiere')
                            ->where('classe_id', $classeId)
                            ->where('matiere_id', $value)
                            ->where('etablissement_id', $tenantId)
                            ->exists();
                        
                        if (!$exists) {
                            $fail("The selected subject is not assigned to this class.");
                        }
                    }
                }
            ],
            'enseignant_id' => [
                'required',
                'integer',
                'exists:enseignants,id',
                function ($attribute, $value, $fail) {
                    $classeId = $this->input('classe_id');
                    $matiereId = $this->input('matiere_id');
                    
                    if ($classeId && $matiereId) {
                        $assignedTeacherId = \Illuminate\Support\Facades\DB::table('charge_horaires')
                            ->where('classe_id', $classeId)
                            ->where('matiere_id', $matiereId)
                            ->value('enseignant_id');
                            
                        if ($assignedTeacherId && $assignedTeacherId != $value) {
                            $fail("The selected teacher is not assigned to this subject in this class.");
                        }
                    }
                }
            ],
        ];
    }
}
