<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Traits\BranchScoped;

#[Fillable([
    'jour',
    'heure_debut',
    'heure_fin',
    'classe_id',
    'enseignant_id',
    'matiere_id',
    'etablissement_id',
    'succursale_id'
])]
class Seance extends Model
{
    use HasFactory, Multitenant, BranchScoped;

    protected $table = 'seances';

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class, 'classe_id');
    }

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class, 'enseignant_id');
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class, 'matiere_id');
    }
}
