<?php

namespace App\Application\UseCases\Admin;

use App\Domain\Ports\StatisticsRepositoryInterface;

class GetAttendanceStatsUseCase
{
    private StatisticsRepositoryInterface $repository;

    public function __construct(StatisticsRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function execute(int $tenantId, string $period): array
    {
        return $this->repository->getAttendanceTrend($tenantId, $period);
    }
}
