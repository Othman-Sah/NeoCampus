<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PresencePortInterface;

class UpdatePresenceStatusUseCase
{
    private PresencePortInterface $presenceRepository;

    public function __construct(PresencePortInterface $presenceRepository)
    {
        $this->presenceRepository = $presenceRepository;
    }

    public function execute(int $id, string $statut, ?string $motif): ?object
    {
        return $this->presenceRepository->updateStatus($id, $statut, $motif);
    }
}
