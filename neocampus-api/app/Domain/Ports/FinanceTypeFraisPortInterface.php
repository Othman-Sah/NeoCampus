<?php

namespace App\Domain\Ports;

interface FinanceTypeFraisPortInterface
{
    public function findById(int $id): ?array;
    public function findAll(array $filters = []): array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): bool;
}
