<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'etablissement_id',
    'matricule',
    'marque',
    'modele',
    'capacite',
    'statut',
    'annee_mise_en_service'
])]
class Vehicule extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicules';

    protected $casts = [
        'capacite' => 'integer',
        'annee_mise_en_service' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Get the tenant establishment that owns the vehicle.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get the drivers assigned to this vehicle.
     */
    public function chauffeurs(): HasMany
    {
        return $this->hasMany(Chauffeur::class, 'vehicule_id');
    }

    /**
     * Get the routes associated with this vehicle.
     */
    public function itineraires(): HasMany
    {
        return $this->hasMany(Itineraire::class, 'vehicule_id');
    }
}
