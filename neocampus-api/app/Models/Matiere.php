<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'etablissement_id',
    'nom',
    'code',
    'intitule',
    'coefficient',
    'groupe_matiere_id',
    'ordre_dans_groupe'
])]
class Matiere extends Model
{
    use HasFactory;

    protected $table = 'matieres';

    protected $appends = ['intitule'];

    protected $casts = [
        'coefficient' => 'float',
        'ordre_dans_groupe' => 'integer',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function getIntituleAttribute($value)
    {
        return $value ?: $this->nom;
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function groupeMatiere(): BelongsTo
    {
        return $this->belongsTo(GroupeMatiere::class, 'groupe_matiere_id');
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class, 'classe_matiere', 'matiere_id', 'classe_id')
            ->withPivot('etablissement_id')
            ->withTimestamps();
    }

    public function enseignants(): BelongsToMany
    {
        return $this->belongsToMany(Enseignant::class, 'charge_horaires', 'matiere_id', 'enseignant_id');
    }
}
