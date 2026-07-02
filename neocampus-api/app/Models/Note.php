<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'valeur',
    'examen_id',
    'eleve_id',
    'etablissement_id'
])]
class Note extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'notes';

    protected $casts = [
        'valeur' => 'float',
    ];

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class);
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
