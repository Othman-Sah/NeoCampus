<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypeFrais extends Model
{
    use Multitenant;

    protected $table = 'type_frais';

    protected $fillable = [
        'libelle',
        'groupe_frais_id',
        'etablissement_id',
        'montant_par_defaut',
    ];

    public function groupe(): BelongsTo
    {
        return $this->belongsTo(GroupeFrais::class, 'groupe_frais_id');
    }
}
