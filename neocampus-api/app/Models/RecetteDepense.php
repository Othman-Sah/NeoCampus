<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecetteDepense extends Model
{
    use Multitenant;

    protected $table = 'recettes_depenses';

    protected $fillable = [
        'libelle',
        'montant',
        'type',
        'categorie',
        'date',
        'justificatif',
        'saisie_par',
        'etablissement_id',
    ];

    public function saisieParUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saisie_par');
    }
}
