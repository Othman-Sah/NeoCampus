<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtablissementSetting extends Model
{
    protected $table = 'etablissement_settings';

    protected $fillable = [
        'etablissement_id',
        'key',
        'value'
    ];

    protected $casts = [
        'value' => 'array'
    ];

    /**
     * Get the establishment that owns this setting.
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
