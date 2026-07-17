<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Succursale extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'succursales';

    protected $fillable = [
        'etablissement_id',
        'nom',
        'adresse',
        'telephone'
    ];

    /**
     * Get the establishment that owns this branch.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get users belonging to this branch.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get students belonging to this branch.
     */
    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class);
    }

    /**
     * Get teachers belonging to this branch.
     */
    public function enseignants(): HasMany
    {
        return $this->hasMany(Enseignant::class);
    }
}
