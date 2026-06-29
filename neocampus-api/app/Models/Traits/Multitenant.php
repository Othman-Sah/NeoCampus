<?php

namespace App\Models\Traits;

use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait Multitenant
{
    /**
     * Boot the multitenant trait for a model.
     */
    public static function bootMultitenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            if (Auth::hasUser()) {
                $user = Auth::user();
                if ($user && !$model->etablissement_id && isset($user->etablissement_id)) {
                    $model->etablissement_id = $user->etablissement_id;
                }
            }
        });
    }
}
