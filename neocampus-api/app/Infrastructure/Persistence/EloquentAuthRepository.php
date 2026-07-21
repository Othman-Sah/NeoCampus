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

        if ($user->disabled_at) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte a été désactivé.'],
            ]);
        }

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Eager load establishment
        $user->load('etablissement');

        $etablissementData = null;
        if ($user->etablissement) {
            $etablissementData = [
                'id' => $user->etablissement->id,
                'nom' => $user->etablissement->nom,
                'plan_tier' => $user->etablissement->plan_tier,
                'subscription_status' => $user->etablissement->subscription_status,
                'trial_ends_at' => $user->etablissement->trial_ends_at ? $user->etablissement->trial_ends_at->toIso8601String() : null,
                'subscription_ends_at' => $user->etablissement->subscription_ends_at ? $user->etablissement->subscription_ends_at->toIso8601String() : null,
            ];
        }

        $userDTO = new UserDTO(
            $user->id,
            $user->etablissement_id,
            $user->nom,
            $user->prenom,
            $user->email,
            $user->role,
            $user->avatar,
            $user->succursale_id,
            $etablissementData
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
        $user = User::with('etablissement')->findOrFail($userId);

        $etablissementData = null;
        if ($user->etablissement) {
            $etablissementData = [
                'id' => $user->etablissement->id,
                'nom' => $user->etablissement->nom,
                'plan_tier' => $user->etablissement->plan_tier,
                'subscription_status' => $user->etablissement->subscription_status,
                'trial_ends_at' => $user->etablissement->trial_ends_at ? $user->etablissement->trial_ends_at->toIso8601String() : null,
                'subscription_ends_at' => $user->etablissement->subscription_ends_at ? $user->etablissement->subscription_ends_at->toIso8601String() : null,
            ];
        }

        return new UserDTO(
            $user->id,
            $user->etablissement_id,
            $user->nom,
            $user->prenom,
            $user->email,
            $user->role,
            $user->avatar,
            $user->succursale_id,
            $etablissementData
        );
    }
}
