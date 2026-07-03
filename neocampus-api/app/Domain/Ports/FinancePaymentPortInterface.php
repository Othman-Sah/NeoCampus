<?php

namespace App\Domain\Ports;

interface FinancePaymentPortInterface
{
    public function findById(int $id): ?array;
    public function findAll(array $filters = []): array;
    public function create(array $data): array;
    public function findByFee(int $feeId): array;
}
