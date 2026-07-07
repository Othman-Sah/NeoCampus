<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;

class UpdateDecisionUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(string $bulletinId, ?string $decision, ?string $mention, ?string $appreciationGenerale): void
    {
        $this->bulletinRepository->updateDecision($bulletinId, $decision, $mention, $appreciationGenerale);
    }
}
