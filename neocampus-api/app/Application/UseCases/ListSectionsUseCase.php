<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ClassPortInterface;

class ListSectionsUseCase
{
    private ClassPortInterface $classRepository;

    public function __construct(ClassPortInterface $classRepository)
    {
        $this->classRepository = $classRepository;
    }

    public function execute(): array
    {
        return $this->classRepository->findAllSections();
    }
}
