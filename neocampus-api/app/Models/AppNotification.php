<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'etablissement_id',
    'target_user_id',
    'type',
    'titre',
    'contenu',
    'link',
    'is_read',
    'date_envoi'
])]
class AppNotification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $casts = [
        'is_read' => 'boolean',
        'date_envoi' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    /**
     * Get the tenant establishment.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Get the user targeted by the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
