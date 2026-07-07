<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;

class PublishBulletinUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(string $bulletinId): void
    {
        $this->bulletinRepository->publish($bulletinId);
    }
}
