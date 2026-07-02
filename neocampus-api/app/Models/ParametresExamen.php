<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'etablissement_id',
    'periode_saisie_notes_debut',
    'periode_saisie_notes_fin',
    'force_admin_schedule',
    'template_sujet_path',
    'require_sujet_upload'
])]
class ParametresExamen extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'parametres_examens';

    protected $casts = [
        'periode_saisie_notes_debut' => 'datetime',
        'periode_saisie_notes_fin' => 'datetime',
        'force_admin_schedule' => 'boolean',
        'require_sujet_upload' => 'boolean'
    ];

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
