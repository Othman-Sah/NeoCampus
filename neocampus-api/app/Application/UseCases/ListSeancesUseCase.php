<?php

namespace App\Application\UseCases;

use App\Domain\Ports\SeancePortInterface;

class ListSeancesUseCase
{
    private SeancePortInterface $seanceRepository;

    public function __construct(SeancePortInterface $seanceRepository)
    {
        $this->seanceRepository = $seanceRepository;
    }

    public function execute(array $filters): array
    {
        if (isset($filters['classe_id'])) {
            return $this->seanceRepository->findAllByClass((int)$filters['classe_id']);
        }

        if (isset($filters['enseignant_id'])) {
            return $this->seanceRepository->findAllByTeacher((int)$filters['enseignant_id']);
        }

        return [];
    }
}
