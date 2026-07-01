<?php

namespace App\Application\UseCases;

use App\Domain\Ports\TeacherPortInterface;

class AssignTeacherToClassUseCase
{
    private TeacherPortInterface $teacherRepository;

    public function __construct(TeacherPortInterface $teacherRepository)
    {
        $this->teacherRepository = $teacherRepository;
    }

    public function execute(int $teacherId, int $classId, int $subjectId): bool
    {
        return $this->teacherRepository->assignToClassAndSubject($teacherId, $classId, $subjectId);
    }
}
