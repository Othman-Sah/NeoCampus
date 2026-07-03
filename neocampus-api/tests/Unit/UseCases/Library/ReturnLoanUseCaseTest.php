<?php

namespace Tests\Unit\UseCases\Library;

use App\Application\DTOs\ReturnLoanDTO;
use App\Application\UseCases\Library\ReturnLoanUseCase;
use App\Domain\Exceptions\LoanAlreadyReturnedException;
use App\Domain\Ports\BookRepositoryInterface;
use App\Domain\Ports\LoanRepositoryInterface;
use App\Models\Adherent;
use App\Models\Etablissement;
use App\Models\Livre;
use App\Models\Emprunt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ReturnLoanUseCaseTest extends TestCase
{
    use RefreshDatabase;

    private ReturnLoanUseCase $useCase;
    private Etablissement $etablissement;
    private User $studentUser;
    private Adherent $adherent;
    private Livre $book;
    private Emprunt $loan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissement = Etablissement::create([
            'nom' => 'Test School',
            'code' => 'TS'
        ]);

        $this->studentUser = User::create([
            'email' => 'student@test.com',
            'nom' => 'Student',
            'prenom' => 'Test',
            'role' => 'eleve',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->adherent = Adherent::create([
            'user_id' => $this->studentUser->id,
            'user_type' => \App\Models\Eleve::class,
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->book = Livre::create([
            'titre' => 'Test Book',
            'auteur' => 'Test Author',
            'isbn' => '1234567890123',
            'genre' => 'Fiction',
            'quantite_stock' => 2,
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->loan = Emprunt::create([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
            'date_emprunt' => now()->subDays(5)->toDateString(),
            'date_retour_prevue' => now()->addDays(9)->toDateString(),
            'statut' => 'en_cours',
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->useCase = new ReturnLoanUseCase(
            $this->app->make(LoanRepositoryInterface::class),
            $this->app->make(BookRepositoryInterface::class)
        );
    }

    public function test_throws_loan_already_returned_exception_when_loan_is_already_rendered(): void
    {
        // Mark as returned first
        $this->loan->update([
            'statut' => 'rendu',
            'date_retour_effective' => now()->toDateString(),
        ]);

        $dto = ReturnLoanDTO::fromArray(['id' => $this->loan->id]);

        $this->expectException(LoanAlreadyReturnedException::class);
        $this->useCase->execute($dto, $this->etablissement->id);
    }

    public function test_successfully_returns_loan_and_increments_stock(): void
    {
        $dto = ReturnLoanDTO::fromArray(['id' => $this->loan->id]);

        $updatedLoan = $this->useCase->execute($dto, $this->etablissement->id);

        $this->assertNotNull($updatedLoan);
        $this->assertEquals('rendu', $updatedLoan->statut);
        $this->assertEquals(now()->toDateString(), $updatedLoan->date_retour_effective);

        // Verify stock was incremented (2 -> 3)
        $this->assertDatabaseHas('livres', [
            'id' => $this->book->id,
            'quantite_stock' => 3,
        ]);

        // Verify loan updated in DB
        $this->assertDatabaseHas('emprunts', [
            'id' => $this->loan->id,
            'statut' => 'rendu',
            'date_retour_effective' => now()->toDateString(),
        ]);
    }
}
