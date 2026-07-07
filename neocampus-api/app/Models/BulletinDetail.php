<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BulletinDetail extends Model
{
    use HasFactory, Multitenant, HasUuids;

    protected $table = 'bulletin_details';

    protected $fillable = [
        'bulletin_id',
        'matiere_id',
        'prof_id',
        'coefficient',
        'moyenne_eleve',
        'moyenne_min',
        'moyenne_max',
        'moyenne_classe_matiere',
        'rang_matiere',
        'appreciation_prof',
        'etablissement_id',
        'notes_detail',
        'sous_total_pondere'
    ];

    protected $casts = [
        'coefficient' => 'float',
        'moyenne_eleve' => 'float',
        'moyenne_min' => 'float',
        'moyenne_max' => 'float',
        'moyenne_classe_matiere' => 'float',
        'rang_matiere' => 'integer',
        'notes_detail' => 'array',
        'sous_total_pondere' => 'float',
    ];

    public function bulletin(): BelongsTo
    {
        return $this->belongsTo(Bulletin::class, 'bulletin_id');
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class, 'matiere_id');
    }

    public function prof(): BelongsTo
    {
        return $this->belongsTo(Enseignant::class, 'prof_id');
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
