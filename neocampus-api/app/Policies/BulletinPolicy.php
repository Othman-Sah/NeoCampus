<?php

namespace App\Policies;

use App\Models\User;

class BulletinPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return false;
    }

    public function generate(User $user): bool
    {
        return $user->role === 'admin';
    }
}
