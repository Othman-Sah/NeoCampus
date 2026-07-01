<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'etablissement_id',
    'user_id',
    'matricule',
    'nom',
    'prenom',
    'email',
    'sexe',
    'date_naissance',
    'classe_id',
    'classe_nom',
    'status',
    'parent_contact',
    'documents',
    'scolarite_anterieure'
])]
class Eleve extends Model
{
    use HasFactory;

    protected $casts = [
        'parent_contact' => 'array',
        'documents' => 'array',
        'date_naissance' => 'date',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        // Enforce SaaS tenant isolation globally
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Get the tenant establishment that owns this student.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get the associated credentials/login user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the class this student is assigned to.
     */
    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class, 'classe_id');
    }
}
