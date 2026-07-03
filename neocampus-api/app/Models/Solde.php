<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Solde extends Model
{
    use Multitenant;

    protected $table = 'soldes';

    protected $fillable = [
        'eleve_id',
        'etablissement_id',
        'montant_du',
        'montant_paye',
    ];

    // Table only has updated_at timestamp
    const CREATED_AT = null;

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class, 'eleve_id');
    }
}
