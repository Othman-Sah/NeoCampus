<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Auth;

trait BranchScoped
{
    /**
     * Boot the BranchScoped trait for a model.
     */
    public static function bootBranchScoped(): void
    {
        static::creating(function ($model) {
            if (Auth::hasUser()) {
                $user = Auth::user();
                if ($user) {
                    if (!$model->succursale_id) {
                        if ($user->role === 'admin' && request()->hasHeader('X-Branch-ID')) {
                            $model->succursale_id = request()->header('X-Branch-ID');
                        } else {
                            $model->succursale_id = $user->succursale_id;
                        }
                    }
                }
            }
        });
    }

    /**
     * Check if the model is branch scoped.
     *
     * @return bool
     */
    public function isBranchScoped(): bool
    {
        return true;
    }
}
