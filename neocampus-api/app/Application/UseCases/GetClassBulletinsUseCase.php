<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;

class GetClassBulletinsUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(int $classeId, string $periode, string $anneeScolaire): array
    {
        return $this->bulletinRepository->getBulletinsByClasse($classeId, $periode, $anneeScolaire);
    }
}
