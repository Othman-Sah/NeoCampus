<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;

class ValidateBulletinUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(string $bulletinId, int $adminUserId): void
    {
        $this->bulletinRepository->validate($bulletinId, $adminUserId);
    }
}
