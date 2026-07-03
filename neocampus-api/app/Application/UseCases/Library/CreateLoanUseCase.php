<?php

namespace App\Application\UseCases\Library;

use App\Application\DTOs\CreateLoanDTO;
use App\Domain\Models\Loan;
use App\Domain\Ports\BookRepositoryInterface;
use App\Domain\Ports\LoanRepositoryInterface;
use App\Domain\Ports\MemberRepositoryInterface;
use App\Domain\Exceptions\InsufficientStockException;
use App\Domain\Exceptions\MaxLoansExceededException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;

class CreateLoanUseCase
{
    private BookRepositoryInterface $bookRepository;
    private LoanRepositoryInterface $loanRepository;
    private MemberRepositoryInterface $memberRepository;

    public function __construct(
        BookRepositoryInterface $bookRepository,
        LoanRepositoryInterface $loanRepository,
        MemberRepositoryInterface $memberRepository
    ) {
        $this->bookRepository = $bookRepository;
        $this->loanRepository = $loanRepository;
        $this->memberRepository = $memberRepository;
    }

    public function execute(CreateLoanDTO $dto, int $tenantId): Loan
    {
        // 1. Verify book exists and belongs to the authenticated tenant
        $book = $this->bookRepository->findById($dto->livre_id);
        if (!$book || $book->etablissement_id !== $tenantId) {
            throw new NotFoundHttpException("Book not found in your establishment.");
        }

        // 2. Verify member exists and belongs to the authenticated tenant
        $member = $this->memberRepository->findById($dto->adherent_id);
        if (!$member || $member->etablissement_id !== $tenantId) {
            throw new NotFoundHttpException("Member not found in your establishment.");
        }

        // 3. Fetch tenant library settings
        $maxLoansSetting = DB::table('library_settings')
            ->where('etablissement_id', $tenantId)
            ->where('key', 'max_loans_per_member')
            ->first();
        $maxLoans = $maxLoansSetting ? json_decode($maxLoansSetting->value, true) : 5;

        $loanDurationSetting = DB::table('library_settings')
            ->where('etablissement_id', $tenantId)
            ->where('key', 'loan_duration_days')
            ->first();
        $loanDuration = $loanDurationSetting ? json_decode($loanDurationSetting->value, true) : 14;

        // 4. Check if the member has reached active loan limits (statut: en_cours or en_retard)
        $activeLoansCount = DB::table('emprunts')
            ->where('adherent_id', $member->id)
            ->whereIn('statut', ['en_cours', 'en_retard'])
            ->whereNull('date_retour_effective')
            ->count();

        if ($activeLoansCount >= $maxLoans) {
            throw new MaxLoansExceededException("The member has already reached the limit of {$maxLoans} active loans.");
        }

        // 5. Check if book stock is available
        if ($book->quantite_stock <= 0) {
            throw new InsufficientStockException("The book '{$book->titre}' is out of stock.");
        }

        // 6. DB Transaction to create loan and decrement stock atomically
        return DB::transaction(function () use ($book, $member, $loanDuration, $tenantId) {
            // Decrement book stock atomically
            $affected = DB::table('livres')
                ->where('id', $book->id)
                ->where('etablissement_id', $tenantId)
                ->where('quantite_stock', '>', 0)
                ->decrement('quantite_stock');

            if ($affected === 0) {
                throw new InsufficientStockException("The book '{$book->titre}' has no copies available.");
            }

            $dateEmprunt = now()->toDateString();
            $dateRetourPrevue = now()->addDays($loanDuration)->toDateString();

            // Create Loan
            $loan = $this->loanRepository->create([
                'livre_id' => $book->id,
                'adherent_id' => $member->id,
                'date_emprunt' => $dateEmprunt,
                'date_retour_prevue' => $dateRetourPrevue,
                'date_retour_effective' => null,
                'statut' => 'en_cours',
                'etablissement_id' => $tenantId
            ]);

            // Logging requirement
            Log::channel('library')->info('Loan created', [
                'loan_id' => $loan->id,
                'livre_id' => $book->id,
                'adherent_id' => $member->id,
                'etablissement_id' => $tenantId
            ]);

            return $loan;
        });
    }
}
