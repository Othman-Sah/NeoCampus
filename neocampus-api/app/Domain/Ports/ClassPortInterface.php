<?php

namespace App\Domain\Ports;

interface ClassPortInterface
{
    public function findById(int $id): ?array;
    public function findAll(array $filters = []): array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): bool;

    // Sections support
    public function findSectionById(int $id): ?array;
    public function findAllSections(): array;
    public function createSection(array $data): array;
    public function updateSection(int $id, array $data): array;
    public function deleteSection(int $id): bool;

    // Academic Years support
    public function findAllAcademicYears(): array;
}
