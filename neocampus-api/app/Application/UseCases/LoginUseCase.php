<?php

namespace App\Application\UseCases;

use App\Domain\Ports\AuthPortInterface;
use App\Application\DTOs\TokenDTO;
use App\Models\User;
use App\Models\Etablissement;
use Illuminate\Validation\ValidationException;

class LoginUseCase
{
    private AuthPortInterface $authRepository;

    public function __construct(AuthPortInterface $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    public function execute(string $email, string $password): TokenDTO
    {
        // 1. Pre-login tenant check: Verify user exists and their school is valid
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Verify the user has a valid establishment associated
        $etablissement = Etablissement::find($user->etablissement_id);
        if (!$etablissement) {
            throw ValidationException::withMessages([
                'email' => ["L'établissement associé à ce compte est invalide ou suspendu."],
            ]);
        }

        // 2. Delegate authentication to the Domain Port / Repository adapter
        return $this->authRepository->login($email, $password);
    }
}
