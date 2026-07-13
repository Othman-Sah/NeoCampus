<?php

namespace App\Application\UseCases\Admin;

use App\Domain\Ports\StatisticsRepositoryInterface;

class GetRecentActivitiesUseCase
{
    private StatisticsRepositoryInterface $repository;

    public function __construct(StatisticsRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function execute(int $tenantId, int $limit = 10): array
    {
        return $this->repository->getRecentActivities($tenantId, $limit);
    }
}
