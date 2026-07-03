<?php

namespace App\Application\UseCases;

use App\Application\DTOs\ApplyPenaliteDTO;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ApplyPenaliteUseCase
{
    private FinanceFeePortInterface $feePort;
    private FinanceSoldePortInterface $soldePort;

    public function __construct(
        FinanceFeePortInterface $feePort,
        FinanceSoldePortInterface $soldePort
    ) {
        $this->feePort = $feePort;
        $this->soldePort = $soldePort;
    }

    public function execute(ApplyPenaliteDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $fee = $this->feePort->findById($dto->frais_id);
            if (!$fee) {
                throw new FinanceException("Fee ID {$dto->frais_id} not found.", 404);
            }

            // Apply penalite
            $penaliteData = [
                'montant' => $dto->montant,
                'motif' => $dto->motif,
                'applique_par' => Auth::id()
            ];

            $penalite = $this->feePort->applyPenalite($dto->frais_id, $penaliteData);

            // Fetch updated fee to recalculate status
            $updatedFee = $this->feePort->findById($dto->frais_id);

            // Recalculate net due amount
            $baseMontant = (float) $updatedFee['montant'];
            $remiseMontant = 0.0;
            foreach ($updatedFee['remises'] ?? [] as $r) {
                $remiseMontant += $baseMontant * ((float) $r['pourcentage'] / 100);
            }

            $penaliteMontant = 0.0;
            foreach ($updatedFee['penalites'] ?? [] as $p) {
                $penaliteMontant += (float) $p['montant'];
            }

            $netAmount = $baseMontant - $remiseMontant + $penaliteMontant;

            $paidAmount = 0.0;
            foreach ($updatedFee['paiements'] ?? [] as $pay) {
                $paidAmount += (float) $pay['montant_paye'];
            }

            $newStatus = 'en_attente';
            if (round($paidAmount, 2) >= round($netAmount, 2)) {
                $newStatus = 'paye';
            } else {
                $newStatus = (strtotime($updatedFee['date_echeance']) < time()) ? 'en_retard' : 'en_attente';
            }

            $this->feePort->update($dto->frais_id, ['statut' => $newStatus]);

            // Recalculate student balance (soldes table)
            $this->recalculateStudentSolde($updatedFee['eleve_id']);

            return $penalite;
        });
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
