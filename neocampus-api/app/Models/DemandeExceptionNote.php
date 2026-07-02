<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enseignant_id',
    'examen_id',
    'motif',
    'statut',
    'admin_id',
    'etablissement_id'
])]
class DemandeExceptionNote extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'demandes_exceptions_notes';

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
