<?php

namespace App\Application\UseCases;

use App\Application\DTOs\GenerateBulletinDTO;
use App\Domain\Ports\BulletinPortInterface;

class GenerateBulletinsUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(GenerateBulletinDTO $dto): array
    {
        return $this->bulletinRepository->generateBulk($dto->classe_id, $dto->periode);
    }
}
