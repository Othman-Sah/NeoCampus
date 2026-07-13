<?php

namespace App\Application\UseCases\StudentPortal;

use App\Domain\Ports\StudentPortalPortInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetStudentTimetableUseCase
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

        return $this->studentPortalRepository->getMyTimetable($userId);
    }
}
