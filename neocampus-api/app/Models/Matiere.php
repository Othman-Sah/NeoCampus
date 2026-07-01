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
    'intitule'
])]
class Matiere extends Model
{
    use HasFactory;

    protected $table = 'matieres';

    protected $appends = ['intitule'];

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

    public function enseignants(): BelongsToMany
    {
        return $this->belongsToMany(Enseignant::class, 'charge_horaires', 'matiere_id', 'enseignant_id');
    }
}
