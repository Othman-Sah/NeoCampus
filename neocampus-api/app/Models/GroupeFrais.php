<?php

namespace App\Models;

use App\Models\Traits\Multitenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupeFrais extends Model
{
    use Multitenant;

    protected $table = 'groupe_frais';

    protected $fillable = [
        'nom',
        'description',
        'etablissement_id',
    ];

    public function typeFrais(): HasMany
    {
        return $this->hasMany(TypeFrais::class, 'groupe_frais_id');
    }
}
