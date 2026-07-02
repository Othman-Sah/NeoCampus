<?php

namespace App\Domain\Ports;

interface ExamenPortInterface
{
    /**
     * Propose a new exam date and schedule.
     */
    public function proposeSchedule(int $enseignantId, array $data): array;

    /**
     * Admin reviews an exam schedule proposal.
     */
    public function reviewSchedule(int $proposalId, string $status, ?string $comment, ?int $adminId): object;

    /**
     * Upload official docx/pdf exam paper.
     */
    public function uploadSujet(int $examenId, string $path): object;

    /**
     * Retrieve exam parameters for the tenant.
     */
    public function findSettings(): ?object;

    /**
     * Update exam parameters for the tenant.
     */
    public function updateSettings(array $data): object;

    /**
     * Find exam by ID.
     */
    public function findById(int $id): ?object;

    /**
     * Get all pending schedule proposals.
     */
    public function getPendingProposals(): array;

    /**
     * Get all exam records for a teacher.
     */
    public function getTeacherExams(int $enseignantId): array;
}
