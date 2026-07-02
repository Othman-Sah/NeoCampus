<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Note;

class GradePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'enseignant']);
    }

    public function view(User $user, Note $note): bool
    {
        return $user->etablissement_id === $note->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'enseignant']);
    }

    public function update(User $user, Note $note): bool
    {
        return $user->etablissement_id === $note->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function requestException(User $user): bool
    {
        return $user->role === 'enseignant';
    }

    public function approveException(User $user): bool
    {
        return $user->role === 'admin';
    }
}
