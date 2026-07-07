<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupeMatiere extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'groupe_matieres';

    protected $fillable = [
        'nom',
        'ordre',
        'etablissement_id',
    ];

    protected $casts = [
        'ordre' => 'integer',
    ];

    public function matieres(): HasMany
    {
        return $this->hasMany(Matiere::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
