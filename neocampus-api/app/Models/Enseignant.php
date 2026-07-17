<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Traits\BranchScoped;

#[Fillable([
    'etablissement_id',
    'succursale_id',
    'user_id',
    'specialite',
    'salaire_de_base'
])]
class Enseignant extends Model
{
    use HasFactory, BranchScoped;

    protected $table = 'enseignants';

    protected $casts = [
        'salaire_de_base' => 'float'
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matieres(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'charge_horaires', 'enseignant_id', 'matiere_id');
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class, 'charge_horaires', 'enseignant_id', 'classe_id');
    }

    public function salaires(): HasMany
    {
        return $this->hasMany(EnseignantSalaire::class, 'enseignant_id');
    }

    public function chargeHoraires(): HasMany
    {
        return $this->hasMany(ChargeHoraire::class, 'enseignant_id');
    }
}
