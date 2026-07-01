<?php

namespace App\Application\UseCases;

use App\Domain\Models\Teacher;
use App\Domain\Ports\TeacherPortInterface;

class ListTeachersUseCase
{
    private TeacherPortInterface $teacherRepository;

    public function __construct(TeacherPortInterface $teacherRepository)
    {
        $this->teacherRepository = $teacherRepository;
    }

    /** @return Teacher[] */
    public function execute(array $filters = []): array
    {
        return $this->teacherRepository->findAll($filters);
    }
}
