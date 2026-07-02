<?php

namespace App\Application\UseCases;

use App\Application\DTOs\BulkAttendanceDTO;
use App\Domain\Ports\PresencePortInterface;

class SubmitBulkAttendanceUseCase
{
    private PresencePortInterface $presenceRepository;

    public function __construct(PresencePortInterface $presenceRepository)
    {
        $this->presenceRepository = $presenceRepository;
    }

    public function execute(BulkAttendanceDTO $dto): array
    {
        $presencesArray = array_map(fn($p) => $p->toArray(), $dto->presences);
        return $this->presenceRepository->submitBulk($dto->seance_id, $dto->date, $presencesArray);
    }
}
