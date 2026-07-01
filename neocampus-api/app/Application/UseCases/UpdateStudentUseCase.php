<?php

namespace App\Application\UseCases;

use App\Application\DTOs\StudentOutputDTO;
use App\Domain\Ports\StudentPortInterface;

class UpdateStudentUseCase
{
    private StudentPortInterface $studentRepository;

    public function __construct(StudentPortInterface $studentRepository)
    {
        $this->studentRepository = $studentRepository;
    }

    public function execute(int $id, array $data): StudentOutputDTO
    {
        // Delegate student update logic to the repository adapter
        $updatedData = $this->studentRepository->update($id, $data);

        return StudentOutputDTO::fromArray($updatedData);
    }
}
