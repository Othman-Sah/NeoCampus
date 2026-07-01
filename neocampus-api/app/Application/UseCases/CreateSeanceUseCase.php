<?php

namespace App\Application\UseCases;

use App\Application\DTOs\SeanceDTO;
use App\Domain\Ports\SeancePortInterface;
use Illuminate\Validation\ValidationException;

class CreateSeanceUseCase
{
    private SeancePortInterface $seanceRepository;

    public function __construct(SeancePortInterface $seanceRepository)
    {
        $this->seanceRepository = $seanceRepository;
    }

    public function execute(SeanceDTO $dto): array
    {
        // Check for conflicts: overlapping slots for either the teacher or class
        $conflict = $this->seanceRepository->hasConflict(
            $dto->jour,
            $dto->heure_debut,
            $dto->heure_fin,
            $dto->classe_id,
            $dto->enseignant_id
        );

        if ($conflict) {
            throw ValidationException::withMessages([
                'conflict' => ['A conflict was detected: the teacher or class is already scheduled during this time slot.'],
            ]);
        }

        return $this->seanceRepository->create($dto->toArray());
    }
}
