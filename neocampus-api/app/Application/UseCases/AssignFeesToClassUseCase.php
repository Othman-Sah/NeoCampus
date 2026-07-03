<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceTypeFraisPortInterface;
use App\Domain\Ports\StudentPortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use Illuminate\Support\Facades\DB;

class AssignFeesToClassUseCase
{
    private FinanceFeePortInterface $feePort;
    private FinanceTypeFraisPortInterface $typeFraisPort;
    private StudentPortInterface $studentPort;
    private FinanceSoldePortInterface $soldePort;

    public function __construct(
        FinanceFeePortInterface $feePort,
        FinanceTypeFraisPortInterface $typeFraisPort,
        StudentPortInterface $studentPort,
        FinanceSoldePortInterface $soldePort
    ) {
        $this->feePort = $feePort;
        $this->typeFraisPort = $typeFraisPort;
        $this->studentPort = $studentPort;
        $this->soldePort = $soldePort;
    }

    public function execute(int $classeId, array $typeFraisIds, string $dateEcheance, ?string $anneeScolaire): array
    {
        $students = $this->studentPort->findAllByClasse($classeId);
        $assigned = [];

        foreach ($students as $student) {
            $studentId = $student['id'];
            foreach ($typeFraisIds as $typeFraisId) {
                $typeFrais = $this->typeFraisPort->findById($typeFraisId);
                if (!$typeFrais) continue;

                $feeData = [
                    'type_frais_id' => $typeFraisId,
                    'eleve_id' => $studentId,
                    'montant' => $typeFrais['montant_par_defaut'],
                    'date_echeance' => $dateEcheance,
                    'statut' => 'en_attente',
                    'annee_scolaire' => $anneeScolaire
                ];

                // Create the fee
                $fee = $this->feePort->create($feeData);
                $assigned[] = $fee;
            }

            // Recalculate student balance
            $this->recalculateStudentSolde($studentId);
        }

        return $assigned;
    }

    private function recalculateStudentSolde(int $studentId): void
    {
        // Fetch all student fees
        $fees = $this->feePort->findAll(['eleve_id' => $studentId]);
        
        $totalDue = 0.0;
        $totalPaid = 0.0;

        foreach ($fees as $fee) {
            // Net fee calculation
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

        $this->soldePort->createOrUpdate($studentId, [
            'montant_du' => $totalDue,
            'montant_paye' => $totalPaid,
        ]);
    }
}
