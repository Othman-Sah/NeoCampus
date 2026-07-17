<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Traits\BranchScoped;

#[Fillable([
    'etablissement_id',
    'succursale_id',
    'nom',
    'zone',
    'description',
    'vehicule_id',
    'heure_depart',
    'heure_retour',
    'statut'
])]
class Itineraire extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'itineraires';

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Get the tenant establishment.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get the vehicle assigned to this route.
     */
    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class, 'vehicule_id');
    }

    /**
     * Get the students assigned to this route.
     */
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(Eleve::class, 'eleve_itineraire', 'itineraire_id', 'eleve_id')
            ->withPivot('point_ramassage', 'latitude', 'longitude')
            ->withTimestamps();
    }
}
