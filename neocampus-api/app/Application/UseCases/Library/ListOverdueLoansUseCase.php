<?php

namespace App\Application\UseCases\Library;

use App\Domain\Ports\LoanRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ListOverdueLoansUseCase
{
    private LoanRepositoryInterface $loanRepository;

    public function __construct(LoanRepositoryInterface $loanRepository)
    {
        $this->loanRepository = $loanRepository;
    }

    public function execute(int $perPage, int $tenantId): LengthAwarePaginator
    {
        $today = now()->toDateString();

        // Find all loans that are overdue (due date in past and status is en_cours)
        $overdueIds = DB::table('emprunts')
            ->where('etablissement_id', $tenantId)
            ->where('date_retour_prevue', '<', $today)
            ->where('statut', 'en_cours')
            ->pluck('id')
            ->toArray();

        if (!empty($overdueIds)) {
            // Bulk update status to 'en_retard'
            DB::table('emprunts')
                ->whereIn('id', $overdueIds)
                ->update([
                    'statut' => 'en_retard',
                    'updated_at' => now()
                ]);

            // Log each flagged loan without triggering database queries in the loop
            foreach ($overdueIds as $loanId) {
                Log::channel('library')->info('Overdue loan flagged', [
                    'loan_id' => $loanId,
                    'etablissement_id' => $tenantId
                ]);
            }
        }

        // Return the paginated overdue loans list
        return $this->loanRepository->listOverdue($perPage);
    }
}
