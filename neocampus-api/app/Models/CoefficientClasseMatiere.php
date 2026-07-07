<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoefficientClasseMatiere extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'coefficient_classe_matiere';

    protected $fillable = [
        'classe_id',
        'matiere_id',
        'coefficient',
        'etablissement_id',
    ];

    protected $casts = [
        'coefficient' => 'float',
    ];

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
