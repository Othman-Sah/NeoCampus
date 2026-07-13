<?php

namespace App\Domain\Ports;

interface StatisticsRepositoryInterface
{
    /**
     * Get overview statistics (student count, teacher count, class count, daily attendance, collection rate).
     *
     * @param int $tenantId
     * @return array
     */
    public function getOverviewStats(int $tenantId): array;

    /**
     * Get attendance rate history over the specified period (week or month).
     *
     * @param int $tenantId
     * @param string $period
     * @return array
     */
    public function getAttendanceTrend(int $tenantId, string $period): array;

    /**
     * Get grade averages, minimums, and maximums per subject.
     *
     * @param int $tenantId
     * @return array
     */
    public function getGradeDistribution(int $tenantId): array;

    /**
     * Get finance collections vs outstanding revenue trend per month over the past 6 months.
     *
     * @param int $tenantId
     * @param string $period
     * @return array
     */
    public function getFinanceTrend(int $tenantId, string $period): array;

    /**
     * Get upcoming exam schedules.
     *
     * @param int $tenantId
     * @param int $limit
     * @return array
     */
    public function getUpcomingExams(int $tenantId, int $limit): array;

    /**
     * Get recent logs/activities from payments, absences, and exam scheduling.
     *
     * @param int $tenantId
     * @param int $limit
     * @return array
     */
    public function getRecentActivities(int $tenantId, int $limit): array;
}
