<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ClassPortInterface;

class ListClassesUseCase
{
    private ClassPortInterface $classRepository;

    public function __construct(ClassPortInterface $classRepository)
    {
        $this->classRepository = $classRepository;
    }

    public function execute(array $filters = []): array
    {
        return $this->classRepository->findAll($filters);
    }
}
