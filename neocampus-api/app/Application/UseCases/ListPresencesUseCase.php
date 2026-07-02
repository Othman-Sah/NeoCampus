<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PresencePortInterface;

class ListPresencesUseCase
{
    private PresencePortInterface $presenceRepository;

    public function __construct(PresencePortInterface $presenceRepository)
    {
        $this->presenceRepository = $presenceRepository;
    }

    public function execute(array $filters): array
    {
        return $this->presenceRepository->searchPresences($filters);
    }
}
