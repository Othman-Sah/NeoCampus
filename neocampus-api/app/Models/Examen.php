<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'date',
    'intitule',
    'classe_id',
    'matiere_id',
    'status',
    'periode',
    'fichier_sujet',
    'etablissement_id',
    'type_evaluation_id',
    'poids'
])]
class Examen extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'examens';

    protected $casts = [
        'date' => 'datetime',
        'poids' => 'float',
    ];

    public function typeEvaluation(): BelongsTo
    {
        return $this->belongsTo(TypeEvaluation::class, 'type_evaluation_id');
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function demandesPlannification(): HasMany
    {
        return $this->hasMany(DemandePlannificationExamen::class);
    }

    public function demandesExceptions(): HasMany
    {
        return $this->hasMany(DemandeExceptionNote::class);
    }
}
