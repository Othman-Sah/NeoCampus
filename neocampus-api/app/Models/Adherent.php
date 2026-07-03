<?php

namespace App\Models;

use App\Models\Scopes\EnsureTenantIsolation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Adherent extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'adherents';

    protected $fillable = [
        'user_id',
        'user_type',
        'etablissement_id',
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
     * Polymorphic relationship to User model.
     */
    public function user(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'user_type', 'user_id');
    }

    /**
     * Get loans for this member.
     */
    public function emprunts(): HasMany
    {
        return $this->hasMany(Emprunt::class, 'adherent_id');
    }

    /**
     * Get the tenant establishment.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
