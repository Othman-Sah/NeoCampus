<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ClassPortInterface;

class UpdateClassUseCase
{
    private ClassPortInterface $classRepository;

    public function __construct(ClassPortInterface $classRepository)
    {
        $this->classRepository = $classRepository;
    }

    public function execute(int $id, array $data): array
    {
        return $this->classRepository->update($id, $data);
    }
}
