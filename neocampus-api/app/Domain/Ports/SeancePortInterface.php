<?php

namespace App\Domain\Ports;

interface SeancePortInterface
{
    public function findById(int $id): ?array;
    public function findAllByClass(int $classId): array;
    public function findAllByTeacher(int $teacherId): array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): bool;
    public function hasConflict(string $jour, string $start, string $end, ?int $classId, ?int $teacherId, ?int $excludeId = null): bool;
}
