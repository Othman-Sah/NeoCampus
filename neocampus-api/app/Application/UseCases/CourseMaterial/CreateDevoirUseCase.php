<?php

namespace App\Application\UseCases\CourseMaterial;

use App\Domain\Ports\CourseMaterialPortInterface;
use App\Application\DTOs\CreateDevoirDTO;
use App\Models\Devoir;

class CreateDevoirUseCase
{
    private CourseMaterialPortInterface $courseMaterialRepository;

    public function __construct(CourseMaterialPortInterface $courseMaterialRepository)
    {
        $this->courseMaterialRepository = $courseMaterialRepository;
    }

    public function execute(CreateDevoirDTO $dto): Devoir
    {
        return $this->courseMaterialRepository->createHomework($dto->toArray());
    }
}
