<?php

namespace App\Policies;

use App\Models\Bulletin;
use App\Models\User;
use App\Models\Eleve;
use Illuminate\Auth\Access\HandlesAuthorization;

class BulletinPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the bulletin.
     */
    public function view(User $user, Bulletin $bulletin): bool
    {
        // Admins can view all bulletins
        if ($user->role === 'admin') {
            return true;
        }

        // Teachers can view bulletins to enter comments or reviews
        if ($user->role === 'enseignant') {
            return true;
        }

        // Students can only view their own bulletins
        if ($user->role === 'eleve') {
            $student = Eleve::where('user_id', $user->id)->first();
            return $student && $student->id === $bulletin->eleve_id;
        }

        // Parents can only view their children's bulletins
        if ($user->role === 'parent') {
            $student = Eleve::find($bulletin->eleve_id);
            if (!$student) {
                return false;
            }
            $parentEmail = strtolower($user->email);
            $studentParentEmail = isset($student->parent_contact['email']) ? strtolower($student->parent_contact['email']) : null;
            return $studentParentEmail === $parentEmail;
        }

        return false;
    }

    /**
     * Determine whether the user can update the bulletin (e.g. appreciations).
     */
    public function update(User $user, Bulletin $bulletin): bool
    {
        return in_array($user->role, ['admin', 'enseignant']);
    }

    /**
     * Determine whether the user can publish the bulletin.
     */
    public function publish(User $user, Bulletin $bulletin): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can generate bulletins.
     */
    public function generate(User $user): bool
    {
        return $user->role === 'admin';
    }
}
