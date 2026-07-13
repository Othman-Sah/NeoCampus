<?php

namespace App\Application\UseCases\ParentPortal;

use App\Domain\Ports\ParentPortalPortInterface;
use App\Application\DTOs\ChildSummaryDTO;

class GetParentChildrenUseCase
{
    private ParentPortalPortInterface $parentPortalRepository;

    public function __construct(ParentPortalPortInterface $parentPortalRepository)
    {
        $this->parentPortalRepository = $parentPortalRepository;
    }

    public function execute(int $parentUserId): array
    {
        $children = $this->parentPortalRepository->getChildren($parentUserId);
        $summaries = [];

        foreach ($children as $child) {
            $summaryData = $this->parentPortalRepository->getChildSummary($parentUserId, $child->id);
            $summaries[] = ChildSummaryDTO::fromArray($summaryData);
        }

        return $summaries;
    }
}
