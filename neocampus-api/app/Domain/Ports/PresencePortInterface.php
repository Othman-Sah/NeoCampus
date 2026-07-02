<?php

namespace App\Domain\Ports;

interface PresencePortInterface
{
    /**
     * Submit bulk attendance for a session and date.
     */
    public function submitBulk(int $seanceId, string $date, array $presences): array;

    /**
     * Get attendance for a class on a specific date.
     */
    public function findByClasseAndDate(int $classeId, string $date): array;

    /**
     * Get attendance history for a student.
     */
    public function findByEleve(int $eleveId): array;

    /**
     * Search non-present records (absences/lates) globally.
     */
    public function searchPresences(array $filters): array;

    /**
     * Update status of a specific presence record.
     */
    public function updateStatus(int $id, string $statut, ?string $motif): ?object;
}
