<?php

namespace App\Application\UseCases\ParentPortal;

use App\Domain\Ports\ParentPortalPortInterface;
use App\Application\DTOs\ChildAttendanceDTO;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class GetChildAttendanceUseCase
{
    private ParentPortalPortInterface $parentPortalRepository;

    public function __construct(ParentPortalPortInterface $parentPortalRepository)
    {
        $this->parentPortalRepository = $parentPortalRepository;
    }

    public function execute(int $parentUserId, int $eleveId, ?string $startDate = null, ?string $endDate = null): array
    {
        if (!$this->parentPortalRepository->verifyParentChildLink($parentUserId, $eleveId)) {
            throw new AccessDeniedHttpException("Unauthorized access to child data.");
        }

        $records = $this->parentPortalRepository->getChildAttendance($parentUserId, $eleveId, $startDate, $endDate);
        $dtos = [];
        foreach ($records as $record) {
            $dtos[] = ChildAttendanceDTO::fromArray($record);
        }

        return $dtos;
    }
}
