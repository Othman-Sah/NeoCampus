<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bulletin extends Model
{
    use HasFactory, Multitenant, HasUuids;

    protected $table = 'bulletins';

    protected $fillable = [
        'eleve_id',
        'classe_id',
        'annee_scolaire',
        'periode',
        'moyenne_generale',
        'moyenne_classe',
        'rang_classe',
        'total_absences',
        'appreciation_generale',
        'status',
        'etablissement_id',
        'decision_conseil',
        'mention',
        'validated_by',
        'validated_at',
        'published_at',
        'absences_justifiees',
        'absences_injustifiees',
        'retards'
    ];

    protected $casts = [
        'moyenne_generale' => 'float',
        'moyenne_classe' => 'float',
        'rang_classe' => 'integer',
        'total_absences' => 'integer',
        'absences_justifiees' => 'integer',
        'absences_injustifiees' => 'integer',
        'retards' => 'integer',
        'validated_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(BulletinDetail::class, 'bulletin_id');
    }
}
