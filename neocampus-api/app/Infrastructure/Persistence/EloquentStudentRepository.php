<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\StudentPortInterface;

class EloquentStudentRepository implements StudentPortInterface
{
    public function findById(int $id): ?array
    {
        return null;
    }

    public function findAllByClasse(int $classeId): array
    {
        return [];
    }

    public function create(array $data): array
    {
        return [];
    }

    public function update(int $id, array $data): array
    {
        return [];
    }

    public function delete(int $id): bool
    {
        return true;
    }

    public function search(array $filters): array
    {
        return [];
    }
}
