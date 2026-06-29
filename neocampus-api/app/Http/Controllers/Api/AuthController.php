<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Application\UseCases\LoginUseCase;
use App\Domain\Ports\AuthPortInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    private LoginUseCase $loginUseCase;
    private AuthPortInterface $authRepository;

    public function __construct(LoginUseCase $loginUseCase, AuthPortInterface $authRepository)
    {
        $this->loginUseCase = $loginUseCase;
        $this->authRepository = $authRepository;
    }

    /**
     * Authenticate user and return TokenDTO.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $tokenDTO = $this->loginUseCase->execute(
            $request->input('email'),
            $request->input('password')
        );

        return response()->json($tokenDTO->toArray(), 200);
    }

    /**
     * Revoke authenticated user tokens.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $this->authRepository->logout($user->id);
            return response()->json(['message' => 'Déconnexion réussie.'], 200);
        }

        return response()->json(['message' => 'Non authentifié.'], 401);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $userDTO = $this->authRepository->me($user->id);

        return response()->json([
            'user' => new UserResource($userDTO),
        ], 200);
    }
}
