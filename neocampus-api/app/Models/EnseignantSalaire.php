<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enseignant_id',
    'etablissement_id',
    'mois',
    'salaire_de_base',
    'primes',
    'indemnites',
    'retenues',
    'salaire_net',
    'statut',
    'date_paiement',
    'notes'
])]
class EnseignantSalaire extends Model
{
    use HasFactory;

    protected $table = 'enseignant_salaires';

    protected $casts = [
        'salaire_de_base' => 'float',
        'primes' => 'float',
        'indemnites' => 'float',
        'retenues' => 'float',
        'salaire_net' => 'float',
        'date_paiement' => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class, 'enseignant_id');
    }
}
