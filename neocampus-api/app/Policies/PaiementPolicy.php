<?php

namespace App\Policies;

use App\Models\Paiement;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaiementPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    /**
     * Determine whether the user can view any payments.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'comptable';
    }

    /**
     * Determine whether the user can view the payment.
     */
    public function view(User $user, Paiement $paiement): bool
    {
        return $user->role === 'comptable';
    }

    /**
     * Determine whether the user can record/create payments.
     */
    public function create(User $user): bool
    {
        return $user->role === 'comptable';
    }

    /**
     * Determine whether the user can update/correct payments.
     */
    public function update(User $user, Paiement $paiement): bool
    {
        return $user->role === 'comptable';
    }

    /**
     * Determine whether the user can delete payments.
     */
    public function delete(User $user, Paiement $paiement): bool
    {
        return $user->role === 'comptable';
    }
}
