<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BulletinConfig extends Model
{
    use HasFactory, Multitenant;

    protected $table = 'bulletin_configs';

    protected $fillable = [
        'niveau',
        'format_periode',
        'seuil_encouragements',
        'seuil_tableau_honneur',
        'seuil_felicitations',
        'show_min_max',
        'show_rang_matiere',
        'show_detail_notes',
        'show_sous_total_groupe',
        'note_eliminatoire',
        'etablissement_id',
    ];

    protected $casts = [
        'seuil_encouragements' => 'float',
        'seuil_tableau_honneur' => 'float',
        'seuil_felicitations' => 'float',
        'show_min_max' => 'boolean',
        'show_rang_matiere' => 'boolean',
        'show_detail_notes' => 'boolean',
        'show_sous_total_groupe' => 'boolean',
        'note_eliminatoire' => 'float',
    ];

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
