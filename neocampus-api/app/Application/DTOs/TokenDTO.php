<?php

namespace App\Application\DTOs;

class TokenDTO
{
    public string $token;
    public string $tokenType;
    public UserDTO $user;

    public function __construct(string $token, string $tokenType, UserDTO $user)
    {
        $this->token = $token;
        $this->tokenType = $tokenType;
        $this->user = $user;
    }

    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'token_type' => $this->tokenType,
            'user' => $this->user->toArray(),
        ];
    }
}
