<?php

namespace App\Application\UseCases\Library;

use App\Application\DTOs\ReturnLoanDTO;
use App\Domain\Models\Loan;
use App\Domain\Ports\LoanRepositoryInterface;
use App\Domain\Ports\BookRepositoryInterface;
use App\Domain\Exceptions\LoanAlreadyReturnedException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ReturnLoanUseCase
{
    private LoanRepositoryInterface $loanRepository;
    private BookRepositoryInterface $bookRepository;

    public function __construct(
        LoanRepositoryInterface $loanRepository,
        BookRepositoryInterface $bookRepository
    ) {
        $this->loanRepository = $loanRepository;
        $this->bookRepository = $bookRepository;
    }

    public function execute(ReturnLoanDTO $dto, int $tenantId): Loan
    {
        $loan = $this->loanRepository->findById($dto->id);
        if (!$loan || $loan->etablissement_id !== $tenantId) {
            throw new NotFoundHttpException("Loan not found in your establishment.");
        }

        if ($loan->date_retour_effective !== null || $loan->statut === 'rendu') {
            throw new LoanAlreadyReturnedException("This loan has already been returned.");
        }

        return DB::transaction(function () use ($loan, $tenantId) {
            // Update loan status and return date
            $updatedLoan = $this->loanRepository->markReturned($loan->id, now()->toDateString());

            // Increment book stock
            DB::table('livres')
                ->where('id', $loan->livre_id)
                ->where('etablissement_id', $tenantId)
                ->increment('quantite_stock');

            // Logging requirement
            Log::channel('library')->info('Book returned', [
                'loan_id' => $loan->id,
                'livre_id' => $loan->livre_id,
                'adherent_id' => $loan->adherent_id,
                'etablissement_id' => $tenantId
            ]);

            return $updatedLoan;
        });
    }
}
