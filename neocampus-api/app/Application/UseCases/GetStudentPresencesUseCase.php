<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PresencePortInterface;

class GetStudentPresencesUseCase
{
    private PresencePortInterface $presenceRepository;

    public function __construct(PresencePortInterface $presenceRepository)
    {
        $this->presenceRepository = $presenceRepository;
    }

    public function execute(int $eleveId): array
    {
        return $this->presenceRepository->findByEleve($eleveId);
    }
}
