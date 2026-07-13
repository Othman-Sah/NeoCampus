<?php

namespace App\Application\UseCases\CourseMaterial;

use App\Domain\Ports\CourseMaterialPortInterface;
use App\Application\DTOs\CreateDevoirDTO;
use App\Models\Devoir;

class UpdateDevoirUseCase
{
    private CourseMaterialPortInterface $courseMaterialRepository;

    public function __construct(CourseMaterialPortInterface $courseMaterialRepository)
    {
        $this->courseMaterialRepository = $courseMaterialRepository;
    }

    public function execute(int $id, CreateDevoirDTO $dto): ?Devoir
    {
        return $this->courseMaterialRepository->updateHomework($id, $dto->toArray());
    }
}
