<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeEvaluation extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'type_evaluations';

    protected $fillable = [
        'nom',
        'code',
        'poids_defaut',
        'etablissement_id',
    ];

    protected $casts = [
        'poids_defaut' => 'float',
    ];

    public function examens(): HasMany
    {
        return $this->hasMany(Examen::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
