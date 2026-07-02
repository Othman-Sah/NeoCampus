<?php

namespace App\Domain\Ports;

interface GradePortInterface
{
    /**
     * Submit bulk grades for an exam.
     */
    public function submitBulk(int $examenId, array $grades): array;

    /**
     * Request an exception to edit grades outside allowed entry window.
     */
    public function requestException(int $enseignantId, int $examenId, string $motif): object;

    /**
     * Admin grants/approves exception.
     */
    public function approveException(int $exceptionId, int $adminId): object;

    /**
     * Check if a teacher has an active approved exception for a specific exam.
     */
    public function hasActiveException(int $enseignantId, int $examenId): bool;

    /**
     * Get all pending grade edit exception requests.
     */
    public function getPendingExceptions(): array;

    /**
     * Get grades entered for an exam.
     */
    public function findByExamen(int $examenId): array;
}
