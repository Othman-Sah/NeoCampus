<?php

namespace App\Domain\Ports;

interface StudentPortInterface
{
    /**
     * Find a student by ID.
     *
     * @param int $id
     * @return array|null
     */
    public function findById(int $id): ?array;

    /**
     * Get all students in a specific class.
     *
     * @param int $classeId
     * @return array
     */
    public function findAllByClasse(int $classeId): array;

    /**
     * Create a new student record.
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array;

    /**
     * Update an existing student record.
     *
     * @param int $id
     * @param array $data
     * @return array
     */
    public function update(int $id, array $data): array;

    /**
     * Delete a student record.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Search students with filters.
     *
     * @param array $filters
     * @return array
     */
    public function search(array $filters): array;
}
