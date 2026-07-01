<?php

namespace App\Application\UseCases;

use App\Domain\Models\Teacher;
use App\Domain\Ports\TeacherPortInterface;

class CreateTeacherUseCase
{
    private TeacherPortInterface $teacherRepository;

    public function __construct(TeacherPortInterface $teacherRepository)
    {
        $this->teacherRepository = $teacherRepository;
    }

    public function execute(array $data): Teacher
    {
        return $this->teacherRepository->create($data);
    }
}
