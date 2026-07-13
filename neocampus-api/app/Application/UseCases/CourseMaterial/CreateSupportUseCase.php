<?php

namespace App\Application\UseCases\CourseMaterial;

use App\Domain\Ports\CourseMaterialPortInterface;
use App\Application\DTOs\CreateSupportDTO;
use App\Models\Support;

class CreateSupportUseCase
{
    private CourseMaterialPortInterface $courseMaterialRepository;

    public function __construct(CourseMaterialPortInterface $courseMaterialRepository)
    {
        $this->courseMaterialRepository = $courseMaterialRepository;
    }

    public function execute(CreateSupportDTO $dto): Support
    {
        return $this->courseMaterialRepository->createSupport($dto->toArray());
    }
}
