<?php

namespace App\Domain\Ports;

interface FinanceSoldePortInterface
{
    public function findByStudent(int $studentId): ?array;
    public function createOrUpdate(int $studentId, array $data): array;
}
