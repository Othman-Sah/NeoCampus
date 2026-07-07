<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'seance_id',
    'eleve_id',
    'statut',
    'motif',
    'date',
    'etablissement_id',
    'justifie'
])]
class Presence extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'presences';

    protected $casts = [
        'justifie' => 'boolean',
    ];

    public function seance(): BelongsTo
    {
        return $this->belongsTo(Seance::class);
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
