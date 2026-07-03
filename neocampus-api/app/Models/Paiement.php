<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use Multitenant;

    protected $table = 'paiements';

    protected $fillable = [
        'frais_id',
        'montant_paye',
        'date_paiement',
        'mode',
        'reference',
        'comptable_id',
        'etablissement_id',
    ];

    public function frais(): BelongsTo
    {
        return $this->belongsTo(Frais::class, 'frais_id');
    }

    public function comptable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'comptable_id');
    }
}
