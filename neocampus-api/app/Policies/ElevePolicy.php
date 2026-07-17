<?php

namespace App\Policies;

use App\Models\Eleve;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ElevePolicy
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
     * Determine whether the user can view any student records.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'comptable', 'enseignant']);
    }

    /**
     * Determine whether the user can view a specific student.
     */
    public function view(User $user, Eleve $eleve): bool
    {
        if (in_array($user->role, ['admin', 'comptable', 'enseignant'])) {
            return true;
        }

        // Student owner
        if ($user->role === 'eleve') {
            return $eleve->user_id === $user->id;
        }

        // Parent of the student (via parent_eleve relationship)
        if ($user->role === 'parent') {
            return $eleve->parents()->where('parent_user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create a student.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update a student.
     */
    public function update(User $user, Eleve $eleve): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete a student.
     */
    public function delete(User $user, Eleve $eleve): bool
    {
        return $user->role === 'admin';
    }
}
