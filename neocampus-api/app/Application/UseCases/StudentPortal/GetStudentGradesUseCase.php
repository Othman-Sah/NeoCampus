<?php

namespace App\Application\UseCases\StudentPortal;

use App\Domain\Ports\StudentPortalPortInterface;
use App\Application\DTOs\ChildGradeDTO;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetStudentGradesUseCase
{
    private StudentPortalPortInterface $studentPortalRepository;

    public function __construct(StudentPortalPortInterface $studentPortalRepository)
    {
        $this->studentPortalRepository = $studentPortalRepository;
    }

    public function execute(int $userId): array
    {
        if (!$this->studentPortalRepository->resolveStudent($userId)) {
            throw new NotFoundHttpException("Student record not found.");
        }

        $grades = $this->studentPortalRepository->getMyGrades($userId);
        $dtos = [];
        foreach ($grades as $grade) {
            $dtos[] = ChildGradeDTO::fromArray($grade);
        }

        return $dtos;
    }
}
