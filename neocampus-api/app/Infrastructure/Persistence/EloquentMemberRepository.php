<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Models\Member;
use App\Domain\Ports\MemberRepositoryInterface;
use App\Models\Adherent;

class EloquentMemberRepository implements MemberRepositoryInterface
{
    private function toDomain(Adherent $adherent): Member
    {
        $data = $adherent->toArray();
        if ($adherent->relationLoaded('user') && $adherent->user) {
            $data['user_details'] = $adherent->user->toArray();
        }
        return Member::fromArray($data);
    }

    public function findById(int $id): ?Member
    {
        $adherent = Adherent::with('user')->find($id);
        return $adherent ? $this->toDomain($adherent) : null;
    }

    public function findByUser(int $userId, string $userType): ?Member
    {
        $adherent = Adherent::with('user')
            ->where('user_id', $userId)
            ->where('user_type', $userType)
            ->first();
        return $adherent ? $this->toDomain($adherent) : null;
    }
}
