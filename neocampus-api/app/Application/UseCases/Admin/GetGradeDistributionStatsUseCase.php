<?php

namespace App\Application\UseCases\Admin;

use App\Domain\Ports\StatisticsRepositoryInterface;

class GetGradeDistributionStatsUseCase
{
    private StatisticsRepositoryInterface $repository;

    public function __construct(StatisticsRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function execute(int $tenantId): array
    {
        return $this->repository->getGradeDistribution($tenantId);
    }
}
