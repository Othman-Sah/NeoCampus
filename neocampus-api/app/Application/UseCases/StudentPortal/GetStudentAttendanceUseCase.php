<?php

namespace App\Application\UseCases\StudentPortal;

use App\Domain\Ports\StudentPortalPortInterface;
use App\Application\DTOs\ChildAttendanceDTO;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetStudentAttendanceUseCase
{
    private StudentPortalPortInterface $studentPortalRepository;

    public function __construct(StudentPortalPortInterface $studentPortalRepository)
    {
        $this->studentPortalRepository = $studentPortalRepository;
    }

    public function execute(int $userId, ?string $startDate = null, ?string $endDate = null): array
    {
        if (!$this->studentPortalRepository->resolveStudent($userId)) {
            throw new NotFoundHttpException("Student record not found.");
        }

        $records = $this->studentPortalRepository->getMyAttendance($userId, $startDate, $endDate);
        $dtos = [];
        foreach ($records as $record) {
            $dtos[] = ChildAttendanceDTO::fromArray($record);
        }

        return $dtos;
    }
}
