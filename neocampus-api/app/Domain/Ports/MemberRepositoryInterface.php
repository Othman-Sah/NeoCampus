<?php

namespace App\Domain\Ports;

use App\Domain\Models\Member;

interface MemberRepositoryInterface
{
    public function findById(int $id): ?Member;
    public function findByUser(int $userId, string $userType): ?Member;
}
