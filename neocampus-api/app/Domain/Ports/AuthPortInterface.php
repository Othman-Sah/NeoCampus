<?php

namespace App\Domain\Ports;

use App\Application\DTOs\TokenDTO;
use App\Application\DTOs\UserDTO;

interface AuthPortInterface
{
    /**
     * Authenticate a user and return a token and user details.
     *
     * @param string $email
     * @param string $password
     * @return TokenDTO
     */
    public function login(string $email, string $password): TokenDTO;

    /**
     * Log out a user by revoking their tokens.
     *
     * @param int $userId
     * @return void
     */
    public function logout(int $userId): void;

    /**
     * Get the authenticated user details.
     *
     * @param int $userId
     * @return UserDTO
     */
    public function me(int $userId): UserDTO;
}
