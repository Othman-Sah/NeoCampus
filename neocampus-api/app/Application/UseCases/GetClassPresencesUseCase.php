<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PresencePortInterface;

class GetClassPresencesUseCase
{
    private PresencePortInterface $presenceRepository;

    public function __construct(PresencePortInterface $presenceRepository)
    {
        $this->presenceRepository = $presenceRepository;
    }

    public function execute(int $classeId, string $date): array
    {
        return $this->presenceRepository->findByClasseAndDate($classeId, $date);
    }
}
