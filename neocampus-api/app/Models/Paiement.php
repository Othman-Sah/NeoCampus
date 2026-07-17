<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Traits\BranchScoped;

class Paiement extends Model
{
    use Multitenant, BranchScoped;

    protected $table = 'paiements';

    protected $fillable = [
        'frais_id',
        'montant_paye',
        'date_paiement',
        'mode',
        'reference',
        'comptable_id',
        'etablissement_id',
        'succursale_id',
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
