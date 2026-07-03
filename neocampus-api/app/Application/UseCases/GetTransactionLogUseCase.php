<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceReportPortInterface;

class GetTransactionLogUseCase
{
    private FinanceReportPortInterface $reportPort;

    public function __construct(FinanceReportPortInterface $reportPort)
    {
        $this->reportPort = $reportPort;
    }

    public function execute(array $filters = []): array
    {
        return $this->reportPort->getTransactions($filters);
    }
}
