<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Presence;

class PresencePolicy
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

    public function view(User $user, Presence $presence): bool
    {
        return $user->etablissement_id === $presence->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'enseignant']);
    }

    public function update(User $user, Presence $presence): bool
    {
        return $user->etablissement_id === $presence->etablissement_id &&
               in_array($user->role, ['admin', 'enseignant']);
    }

    public function delete(User $user, Presence $presence): bool
    {
        return $user->etablissement_id === $presence->etablissement_id &&
               $user->role === 'admin';
    }
}
