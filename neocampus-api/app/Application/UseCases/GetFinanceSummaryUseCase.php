<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceReportPortInterface;
use App\Domain\Ports\SalaryPortInterface;

class GetFinanceSummaryUseCase
{
    private FinanceReportPortInterface $reportPort;
    private SalaryPortInterface $salaryPort;

    public function __construct(
        FinanceReportPortInterface $reportPort,
        SalaryPortInterface $salaryPort
    ) {
        $this->reportPort = $reportPort;
        $this->salaryPort = $salaryPort;
    }

    public function execute(array $filters = []): array
    {
        // 1. Get finance summary from report port
        $summary = $this->reportPort->getSummary($filters);

        // 2. Fetch salaries for the current month/filter to calculate salary cost
        $month = $filters['mois'] ?? date('Y-m');
        $salaries = $this->salaryPort->findAll(['mois' => $month]);
        $masseSalariale = 0.0;
        foreach ($salaries as $s) {
            if ($s['statut'] === 'Paid' || $s['statut'] === 'Draft') { // include all validated/draft payroll
                $masseSalariale += (float) $s['salaire_net'];
            }
        }

        $summary['masse_salariale'] = $masseSalariale;

        return $summary;
    }
}
