<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'etablissement_id',
    'nom'
])]
class Section extends Model
{
    use HasFactory;

    protected $table = 'sections';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class, 'section_id');
    }
}
