<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Frais extends Model
{
    use Multitenant;

    protected $table = 'frais';

    protected $fillable = [
        'type_frais_id',
        'eleve_id',
        'etablissement_id',
        'montant',
        'date_echeance',
        'statut',
        'annee_scolaire',
    ];

    public function typeFrais(): BelongsTo
    {
        return $this->belongsTo(TypeFrais::class, 'type_frais_id');
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class, 'eleve_id');
    }

    public function remises(): HasMany
    {
        return $this->hasMany(Remise::class, 'frais_id');
    }

    public function penalites(): HasMany
    {
        return $this->hasMany(Penalite::class, 'frais_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'frais_id');
    }
}
