<?php

namespace App\Domain\Ports;

use App\Models\Eleve;

interface StudentPortalPortInterface
{
    public function getDashboardData(int $userId): array;
    public function getMyGrades(int $userId): array;
    public function getMyAttendance(int $userId, ?string $startDate = null, ?string $endDate = null): array;
    public function getMyTimetable(int $userId): array;
    public function getMyCourseSupports(int $userId): array;
    public function getMyHomework(int $userId): array;

    // Resolves the Eleve record from User ID
    public function resolveStudent(int $userId): ?Eleve;
}
