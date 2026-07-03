<?php

namespace App\Application\UseCases;

use App\Application\DTOs\AssignFeeDTO;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceTypeFraisPortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;

class AssignFeesToStudentUseCase
{
    private FinanceFeePortInterface $feePort;
    private FinanceTypeFraisPortInterface $typeFraisPort;
    private AssignFeesToClassUseCase $assignFeesToClassUseCase;
    private FinanceSoldePortInterface $soldePort;

    public function __construct(
        FinanceFeePortInterface $feePort,
        FinanceTypeFraisPortInterface $typeFraisPort,
        AssignFeesToClassUseCase $assignFeesToClassUseCase,
        FinanceSoldePortInterface $soldePort
    ) {
        $this->feePort = $feePort;
        $this->typeFraisPort = $typeFraisPort;
        $this->assignFeesToClassUseCase = $assignFeesToClassUseCase;
        $this->soldePort = $soldePort;
    }

    public function execute(AssignFeeDTO $dto): array
    {
        if ($dto->classe_id) {
            return $this->assignFeesToClassUseCase->execute(
                $dto->classe_id,
                $dto->type_frais_ids,
                $dto->date_echeance,
                $dto->annee_scolaire
            );
        }

        if (!$dto->eleve_id) {
            throw new FinanceException("Student ID (eleve_id) is required if Class ID is not provided.", 422);
        }

        $assigned = [];
        foreach ($dto->type_frais_ids as $typeFraisId) {
            $typeFrais = $this->typeFraisPort->findById($typeFraisId);
            if (!$typeFrais) {
                throw new FinanceException("Fee Type ID {$typeFraisId} not found.", 404);
            }

            $feeData = [
                'type_frais_id' => $typeFraisId,
                'eleve_id' => $dto->eleve_id,
                'montant' => $typeFrais['montant_par_defaut'],
                'date_echeance' => $dto->date_echeance,
                'statut' => 'en_attente',
                'annee_scolaire' => $dto->annee_scolaire
            ];

            $assigned[] = $this->feePort->create($feeData);
        }

        // Recalculate student balance
        $this->recalculateStudentSolde($dto->eleve_id);

        return $assigned;
    }

    private function recalculateStudentSolde(int $studentId): void
    {
        $fees = $this->feePort->findAll(['eleve_id' => $studentId]);
        
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

        $this->soldePort->createOrUpdate($studentId, [
            'montant_du' => $totalDue,
            'montant_paye' => $totalPaid,
        ]);
    }
}
