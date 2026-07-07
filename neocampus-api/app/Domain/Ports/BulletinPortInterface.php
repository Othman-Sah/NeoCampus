<?php

namespace App\Domain\Ports;

interface BulletinPortInterface
{
    /**
     * Bulk generate bulletins for a class, period, and academic year.
     * Returns the list of generated bulletins as arrays.
     */
    public function generateBulk(int $classeId, string $periode, string $anneeScolaire): array;

    /**
     * Generate or regenerate a single bulletin.
     * Returns the UUID of the generated bulletin.
     */
    public function generateSingle(int $eleveId, string $periode, string $anneeScolaire): string;

    /**
     * Update a teacher/admin's course appreciation.
     */
    public function updateAppreciations(string $bulletinId, int $matiereId, string $appreciation, ?int $teacherId = null): void;

    /**
     * Publish the bulletin.
     */
    public function publish(string $bulletinId): void;

    /**
     * Find a bulletin with all its details, student, and class info.
     */
    public function findWithDetails(string $bulletinId): ?array;

    /**
     * Retrieve all bulletins for a class.
     */
    public function getBulletinsByClasse(int $classeId, string $periode, string $anneeScolaire): array;

    /**
     * Update council decision, mention, and general appreciation.
     */
    public function updateDecision(string $bulletinId, ?string $decision, ?string $mention, ?string $appreciationGenerale): void;

    /**
     * Validate and lock the bulletin.
     */
    public function validate(string $bulletinId, int $adminUserId): void;
}
