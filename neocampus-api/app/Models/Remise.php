<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Remise extends Model
{
    protected $table = 'remises';

    protected $fillable = [
        'frais_id',
        'pourcentage',
        'motif',
        'applique_par',
    ];

    public function frais(): BelongsTo
    {
        return $this->belongsTo(Frais::class, 'frais_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applique_par');
    }
}
