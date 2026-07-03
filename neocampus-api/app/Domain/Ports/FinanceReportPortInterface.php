<?php

namespace App\Domain\Ports;

interface FinanceReportPortInterface
{
    public function getSummary(array $filters = []): array;
    public function getTransactions(array $filters = []): array;
}
