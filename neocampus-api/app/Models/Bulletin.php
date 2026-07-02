<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'eleve_id',
    'periode',
    'moyenne_generale',
    'date_generation',
    'etablissement_id'
])]
class Bulletin extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'bulletins';

    protected $casts = [
        'moyenne_generale' => 'float',
        'date_generation' => 'date',
    ];

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
