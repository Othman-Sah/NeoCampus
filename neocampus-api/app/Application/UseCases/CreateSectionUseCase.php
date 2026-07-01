<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ClassPortInterface;

class CreateSectionUseCase
{
    private ClassPortInterface $classRepository;

    public function __construct(ClassPortInterface $classRepository)
    {
        $this->classRepository = $classRepository;
    }

    public function execute(array $data): array
    {
        return $this->classRepository->createSection($data);
    }
}
