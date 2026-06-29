<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom', 'adresse', 'code'])]
class Etablissement extends Model
{
    use HasFactory;

    /**
     * Get the users registered under this establishment.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
