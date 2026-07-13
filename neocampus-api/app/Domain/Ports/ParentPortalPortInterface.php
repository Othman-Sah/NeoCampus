<?php

namespace App\Domain\Ports;

interface ParentPortalPortInterface
{
    public function getChildren(int $parentUserId): array;
    public function getChildGrades(int $parentUserId, int $eleveId): array;
    public function getChildAttendance(int $parentUserId, int $eleveId, ?string $startDate = null, ?string $endDate = null): array;
    public function getChildTimetable(int $parentUserId, int $eleveId): array;
    public function getChildBalance(int $parentUserId, int $eleveId): array;
    public function getChildBulletins(int $parentUserId, int $eleveId): array;
    public function getChildSummary(int $parentUserId, int $eleveId): array;

    // Verifies the parent actually owns this child (via pivot table)
    public function verifyParentChildLink(int $parentUserId, int $eleveId): bool;
}
