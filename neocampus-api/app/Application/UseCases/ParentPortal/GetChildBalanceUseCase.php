<?php

namespace App\Application\UseCases\ParentPortal;

use App\Domain\Ports\ParentPortalPortInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class GetChildBalanceUseCase
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

        return $this->parentPortalRepository->getChildBalance($parentUserId, $eleveId);
    }
}
