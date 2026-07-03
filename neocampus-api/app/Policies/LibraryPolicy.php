<?php

namespace App\Policies;

use App\Models\User;

class LibraryPolicy
{
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
     * Determine whether the user can view any library resource.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'bibliothecaire';
    }

    /**
     * Determine whether the user can create a book or loan.
     */
    public function create(User $user): bool
    {
        return $user->role === 'bibliothecaire';
    }

    /**
     * Determine whether the user can update a book or return a loan.
     */
    public function update(User $user): bool
    {
        return $user->role === 'bibliothecaire';
    }

    /**
     * Determine whether the user can delete a book.
     */
    public function delete(User $user): bool
    {
        return $user->role === 'bibliothecaire';
    }
}
