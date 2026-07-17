<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use App\Models\Traits\BranchScoped;

#[Fillable([
    'etablissement_id',
    'succursale_id',
    'nom',
    'niveau',
    'section_id',
    'annee_scolaire_id'
])]
class Classe extends Model
{
    use HasFactory, BranchScoped;

    protected $table = 'classes';

    protected static function booted(): void
    {
        // Enforce SaaS tenant isolation globally
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Get the tenant establishment that owns this class.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get the section this class belongs to.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    /**
     * Get the academic year this class belongs to.
     */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class, 'annee_scolaire_id');
    }

    /**
     * Get students enrolled in this class.
     */
    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class, 'classe_id');
    }

    /**
     * Get subjects assigned to this class.
     */
    public function matieres(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'classe_matiere', 'classe_id', 'matiere_id')
            ->withPivot('etablissement_id')
            ->withTimestamps();
    }

    /**
     * Get teachers assigned to this class.
     */
    public function enseignants(): BelongsToMany
    {
        return $this->belongsToMany(Enseignant::class, 'charge_horaires', 'classe_id', 'enseignant_id');
    }

    /**
     * Get the timetables or assignments for this class.
     */
    public function chargeHoraires(): HasMany
    {
        return $this->hasMany(ChargeHoraire::class, 'classe_id');
    }
}
