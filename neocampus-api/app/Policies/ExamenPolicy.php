<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Examen;

class ExamenPolicy
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

    public function view(User $user, Examen $examen): bool
    {
        return $user->etablissement_id === $examen->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'enseignant']);
    }

    public function update(User $user, Examen $examen): bool
    {
        return $user->etablissement_id === $examen->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function proposeSchedule(User $user): bool
    {
        return $user->role === 'enseignant';
    }

    public function reviewSchedule(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function uploadSujet(User $user, Examen $examen): bool
    {
        return $user->etablissement_id === $examen->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }
}
