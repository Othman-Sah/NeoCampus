<?php

namespace App\Application\UseCases;

use App\Application\DTOs\RecordPaymentDTO;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinancePaymentPortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RecordPaymentUseCase
{
    private FinanceFeePortInterface $feePort;
    private FinancePaymentPortInterface $paymentPort;
    private FinanceSoldePortInterface $soldePort;

    public function __construct(
        FinanceFeePortInterface $feePort,
        FinancePaymentPortInterface $paymentPort,
        FinanceSoldePortInterface $soldePort
    ) {
        $this->feePort = $feePort;
        $this->paymentPort = $paymentPort;
        $this->soldePort = $soldePort;
    }

    public function execute(RecordPaymentDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $fee = $this->feePort->findById($dto->frais_id);
            if (!$fee) {
                throw new FinanceException("Fee ID {$dto->frais_id} not found.", 404);
            }

            if ($fee['statut'] === 'paye') {
                throw new FinanceException("Ce frais est déjà entièrement payé", 400);
            }

            // Calculate net due amount
            $baseMontant = (float) $fee['montant'];
            $remiseMontant = 0.0;
            foreach ($fee['remises'] ?? [] as $r) {
                $remiseMontant += $baseMontant * ((float) $r['pourcentage'] / 100);
            }

            $penaliteMontant = 0.0;
            foreach ($fee['penalites'] ?? [] as $p) {
                $penaliteMontant += (float) $p['montant'];
            }

            $netAmount = $baseMontant - $remiseMontant + $penaliteMontant;

            $paidAmount = 0.0;
            foreach ($fee['paiements'] ?? [] as $pay) {
                $paidAmount += (float) $pay['montant_paye'];
            }

            $remaining = $netAmount - $paidAmount;

            if (round($dto->montant_paye, 2) > round($remaining, 2)) {
                throw new FinanceException("Le montant payé dépasse le solde restant", 400);
            }

            // Record payment
            $paymentData = [
                'frais_id' => $dto->frais_id,
                'montant_paye' => $dto->montant_paye,
                'date_paiement' => $dto->date_paiement,
                'mode' => $dto->mode,
                'reference' => $dto->reference,
                'comptable_id' => Auth::id(),
                'etablissement_id' => Auth::user()->etablissement_id ?? $fee['etablissement_id']
            ];

            $payment = $this->paymentPort->create($paymentData);

            // Update fee status
            $newPaidTotal = $paidAmount + $dto->montant_paye;
            $newStatus = 'en_attente';
            if (round($newPaidTotal, 2) >= round($netAmount, 2)) {
                $newStatus = 'paye';
            } else {
                // If it is past due, it's still late
                $newStatus = (strtotime($fee['date_echeance']) < time()) ? 'en_retard' : 'en_attente';
            }

            $this->feePort->update($dto->frais_id, ['statut' => $newStatus]);

            // Recalculate student balance (soldes table)
            $this->recalculateStudentSolde($fee['eleve_id']);

            return $payment;
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
