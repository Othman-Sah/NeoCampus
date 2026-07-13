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

    /**
     * Get the parents linked to this student.
     */
    public function parents(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_eleve', 'eleve_id', 'parent_user_id')
            ->withPivot('relation')
            ->withTimestamps();
    }

    /**
     * Get the homework assigned to this student's class.
     */
    public function devoirs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Devoir::class, 'classe_id', 'classe_id');
    }

    /**
     * Get the course supports shared with this student's class.
     */
    public function supports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Support::class, 'classe_id', 'classe_id');
    }
}
