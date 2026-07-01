<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateStudentDTO;
use App\Application\DTOs\StudentOutputDTO;
use App\Domain\Ports\StudentPortInterface;

class RegisterStudentUseCase
{
    private StudentPortInterface $studentRepository;

    public function __construct(StudentPortInterface $studentRepository)
    {
        $this->studentRepository = $studentRepository;
    }

    public function execute(CreateStudentDTO $dto): StudentOutputDTO
    {
        // Delegate student creation logic to the repository adapter
        $createdData = $this->studentRepository->create($dto->toArray());

        return StudentOutputDTO::fromArray($createdData);
    }
}
