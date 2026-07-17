<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class EnsureTenantIsolation implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (Auth::hasUser()) {
            $user = Auth::user();
            if ($user && isset($user->etablissement_id)) {
                $builder->where($model->getTable() . '.etablissement_id', $user->etablissement_id);

                // Apply branch filter if model is branch scoped
                if (method_exists($model, 'isBranchScoped') && $model->isBranchScoped()) {
                    if ($user->role === 'admin' || $user->role === 'super-admin') {
                        if (request()->hasHeader('X-Branch-ID')) {
                            $builder->where($model->getTable() . '.succursale_id', request()->header('X-Branch-ID'));
                        }
                    } else {
                        if (isset($user->succursale_id)) {
                            $builder->where($model->getTable() . '.succursale_id', $user->succursale_id);
                        }
                    }
                }
            }
        }
    }
}
