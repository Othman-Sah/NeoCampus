<?php

namespace App\Application\UseCases\StudentPortal;

use App\Domain\Ports\StudentPortalPortInterface;
use App\Application\DTOs\StudentDashboardDTO;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetStudentDashboardUseCase
{
    private StudentPortalPortInterface $studentPortalRepository;

    public function __construct(StudentPortalPortInterface $studentPortalRepository)
    {
        $this->studentPortalRepository = $studentPortalRepository;
    }

    public function execute(int $userId): StudentDashboardDTO
    {
        if (!$this->studentPortalRepository->resolveStudent($userId)) {
            throw new NotFoundHttpException("Student record not found.");
        }

        $data = $this->studentPortalRepository->getDashboardData($userId);
        return StudentDashboardDTO::fromArray($data);
    }
}
