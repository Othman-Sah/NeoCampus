<?php

namespace App\Application\UseCases\CourseMaterial;

use App\Domain\Ports\CourseMaterialPortInterface;

class DeleteDevoirUseCase
{
    private CourseMaterialPortInterface $courseMaterialRepository;

    public function __construct(CourseMaterialPortInterface $courseMaterialRepository)
    {
        $this->courseMaterialRepository = $courseMaterialRepository;
    }

    public function execute(int $id): bool
    {
        return $this->courseMaterialRepository->deleteHomework($id);
    }
}
