<?php

namespace App\Models;

use App\Models\Scopes\EnsureTenantIsolation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Emprunt extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'emprunts';

    protected $fillable = [
        'livre_id',
        'adherent_id',
        'date_emprunt',
        'date_retour_prevue',
        'date_retour_effective',
        'statut',
        'amende_payee',
        'amende_annulee',
        'etablissement_id',
    ];

    protected $casts = [
        'date_emprunt' => 'date:Y-m-d',
        'date_retour_prevue' => 'date:Y-m-d',
        'date_retour_effective' => 'date:Y-m-d',
        'amende_payee' => 'boolean',
        'amende_annulee' => 'boolean',
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
     * Get the loaned book.
     */
    public function livre(): BelongsTo
    {
        return $this->belongsTo(Livre::class, 'livre_id')->withTrashed();
    }

    /**
     * Get the borrowing member.
     */
    public function adherent(): BelongsTo
    {
        return $this->belongsTo(Adherent::class, 'adherent_id')->withTrashed();
    }

    /**
     * Get the tenant establishment.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
