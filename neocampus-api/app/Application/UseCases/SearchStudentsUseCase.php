<?php

namespace App\Application\UseCases;

use App\Application\DTOs\StudentOutputDTO;
use App\Domain\Ports\StudentPortInterface;

class SearchStudentsUseCase
{
    private StudentPortInterface $studentRepository;

    public function __construct(StudentPortInterface $studentRepository)
    {
        $this->studentRepository = $studentRepository;
    }

    /**
     * Search and return DTO representations of students.
     *
     * @param array $filters
     * @return StudentOutputDTO[]
     */
    public function execute(array $filters): array
    {
        $studentsData = $this->studentRepository->search($filters);

        return array_map(function ($studentArray) {
            return StudentOutputDTO::fromArray($studentArray);
        }, $studentsData);
    }
}
