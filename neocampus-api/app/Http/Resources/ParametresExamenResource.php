<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParametresExamenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'etablissement_id' => $this->etablissement_id,
            'periode_saisie_notes_debut' => $this->periode_saisie_notes_debut ? $this->periode_saisie_notes_debut->toIso8601String() : null,
            'periode_saisie_notes_fin' => $this->periode_saisie_notes_fin ? $this->periode_saisie_notes_fin->toIso8601String() : null,
            'force_admin_schedule' => $this->force_admin_schedule,
            'template_sujet_path' => $this->template_sujet_path,
            'require_sujet_upload' => $this->require_sujet_upload,
        ];
    }
}
