<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClasseMatiere extends Model
{
    protected $table = 'classe_matiere';
    protected $fillable = ['classe_id', 'matiere_id', 'etablissement_id'];

    protected static function booted(): void
    {
        // Enforce SaaS tenant isolation globally
        static::addGlobalScope(new TenantScope);
    }

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
