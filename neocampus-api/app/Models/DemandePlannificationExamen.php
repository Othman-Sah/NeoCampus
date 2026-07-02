<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enseignant_id',
    'examen_id',
    'date_proposee',
    'statut',
    'commentaire_admin',
    'etablissement_id'
])]
class DemandePlannificationExamen extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'demandes_plannification_examens';

    protected $casts = [
        'date_proposee' => 'datetime'
    ];

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
