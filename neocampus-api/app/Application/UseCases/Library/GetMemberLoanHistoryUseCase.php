<?php

namespace App\Application\UseCases\Library;

use App\Models\Emprunt;
use App\Models\Adherent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GetMemberLoanHistoryUseCase
{
    public function execute(int $tenantId, int $memberId)
    {
        // Verify member exists and belongs to tenant
        $member = Adherent::where('id', $memberId)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$member) {
            throw new NotFoundHttpException("Member not found.");
        }

        // Return all loans, ordered by date_emprunt desc
        return Emprunt::with(['livre', 'adherent.user'])
            ->where('adherent_id', $memberId)
            ->where('etablissement_id', $tenantId)
            ->orderBy('date_emprunt', 'desc')
            ->get();
    }
}
