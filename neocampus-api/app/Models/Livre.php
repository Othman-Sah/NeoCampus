<?php

namespace App\Models;

use App\Models\Scopes\EnsureTenantIsolation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

use App\Models\Traits\BranchScoped;

class Livre extends Model
{
    use HasFactory, SoftDeletes, BranchScoped;

    protected $table = 'livres';

    protected $fillable = [
        'titre',
        'auteur',
        'isbn',
        'genre',
        'quantite_stock',
        'etablissement_id',
        'succursale_id',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new EnsureTenantIsolation);

        static::creating(function ($model) {
            if (Auth::hasUser()) {
                $user = Auth::user();
                if ($user && !$model->etablissement_id && isset($user->etablissement_id)) {
                    $model->etablissement_id = $user->etablissement_id;
                }
            }
        });
    }

    /**
     * Get loans for this book.
     */
    public function emprunts(): HasMany
    {
        return $this->hasMany(Emprunt::class, 'livre_id');
    }

    /**
     * Get the tenant establishment.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
