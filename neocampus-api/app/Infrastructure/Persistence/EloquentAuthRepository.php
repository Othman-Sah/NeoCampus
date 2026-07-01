<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\AuthPortInterface;
use App\Application\DTOs\TokenDTO;
use App\Application\DTOs\UserDTO;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EloquentAuthRepository implements AuthPortInterface
{
    public function login(string $email, string $password): TokenDTO
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        $userDTO = new UserDTO(
            $user->id,
            $user->etablissement_id,
            $user->nom,
            $user->prenom,
            $user->email,
            $user->role,
            $user->avatar
        );

        return new TokenDTO($token, 'Bearer', $userDTO);
    }

    public function logout(int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            // Revoke all user tokens
            $user->tokens()->delete();
        }
    }

    public function me(int $userId): UserDTO
    {
        $user = User::findOrFail($userId);

        return new UserDTO(
            $user->id,
            $user->etablissement_id,
            $user->nom,
            $user->prenom,
            $user->email,
            $user->role,
            $user->avatar
        );
    }
}
