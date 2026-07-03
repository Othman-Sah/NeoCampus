<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Ports\StudentPortInterface;
use App\Domain\Exceptions\FinanceException;

class GetStudentBalanceUseCase
{
    private FinanceFeePortInterface $feePort;
    private FinanceSoldePortInterface $soldePort;
    private StudentPortInterface $studentPort;

    public function __construct(
        FinanceFeePortInterface $feePort,
        FinanceSoldePortInterface $soldePort,
        StudentPortInterface $studentPort
    ) {
        $this->feePort = $feePort;
        $this->soldePort = $soldePort;
        $this->studentPort = $studentPort;
    }

    public function execute(int $studentId): array
    {
        $student = $this->studentPort->findById($studentId);
        if (!$student) {
            throw new FinanceException("Student ID {$studentId} not found.", 404);
        }

        $fees = $this->feePort->findAll(['eleve_id' => $studentId]);
        $solde = $this->soldePort->findByStudent($studentId);

        if (!$solde) {
            // Compute a default/fallback solde if not initialized
            $totalDue = 0.0;
            $totalPaid = 0.0;

            foreach ($fees as $fee) {
                $net = (float) $fee['montant'];
                foreach ($fee['remises'] ?? [] as $r) {
                    $net -= ($fee['montant'] * ((float) $r['pourcentage'] / 100));
                }
                foreach ($fee['penalites'] ?? [] as $p) {
                    $net += (float) $p['montant'];
                }

                $totalDue += $net;

                foreach ($fee['paiements'] ?? [] as $pay) {
                    $totalPaid += (float) $pay['montant_paye'];
                }
            }

            $solde = [
                'eleve_id' => $studentId,
                'montant_du' => $totalDue,
                'montant_paye' => $totalPaid,
                'montant_restant' => $totalDue - $totalPaid,
                'updated_at' => now()->toDateTimeString()
            ];
        }

        return [
            'student' => $student,
            'fees' => $fees,
            'solde' => $solde
        ];
    }
}
