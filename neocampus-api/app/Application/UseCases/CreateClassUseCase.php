<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ClassPortInterface;

class CreateClassUseCase
{
    private ClassPortInterface $classRepository;

    public function __construct(ClassPortInterface $classRepository)
    {
        $this->classRepository = $classRepository;
    }

    public function execute(array $data): array
    {
        return $this->classRepository->create($data);
    }
}
