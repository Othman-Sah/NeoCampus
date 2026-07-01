<?php

namespace App\Application\UseCases;

use App\Domain\Ports\SeancePortInterface;

class DeleteSeanceUseCase
{
    private SeancePortInterface $seanceRepository;

    public function __construct(SeancePortInterface $seanceRepository)
    {
        $this->seanceRepository = $seanceRepository;
    }

    public function execute(int $id): bool
    {
        return $this->seanceRepository->delete($id);
    }
}
