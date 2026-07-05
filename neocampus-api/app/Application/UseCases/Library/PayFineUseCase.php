<?php

namespace App\Application\UseCases\Library;

use App\Models\Emprunt;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PayFineUseCase
{
    public function execute(int $tenantId, int $loanId): Emprunt
    {
        $loan = Emprunt::where('id', $loanId)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$loan) {
            throw new NotFoundHttpException("Loan not found.");
        }

        if ($loan->amende_payee) {
            throw new BadRequestHttpException("Fine is already paid.");
        }

        if ($loan->amende_annulee) {
            throw new BadRequestHttpException("Fine was waived and cannot be paid.");
        }

        $loan->update([
            'amende_payee' => true,
        ]);

        return $loan;
    }
}
