<?php

namespace App\Application\UseCases\ParentPortal;

use App\Domain\Ports\ParentPortalPortInterface;
use App\Application\DTOs\ChildGradeDTO;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class GetChildGradesUseCase
{
    private ParentPortalPortInterface $parentPortalRepository;

    public function __construct(ParentPortalPortInterface $parentPortalRepository)
    {
        $this->parentPortalRepository = $parentPortalRepository;
    }

    public function execute(int $parentUserId, int $eleveId): array
    {
        if (!$this->parentPortalRepository->verifyParentChildLink($parentUserId, $eleveId)) {
            throw new AccessDeniedHttpException("Unauthorized access to child data.");
        }

        $grades = $this->parentPortalRepository->getChildGrades($parentUserId, $eleveId);
        $dtos = [];
        foreach ($grades as $grade) {
            $dtos[] = ChildGradeDTO::fromArray($grade);
        }

        return $dtos;
    }
}
