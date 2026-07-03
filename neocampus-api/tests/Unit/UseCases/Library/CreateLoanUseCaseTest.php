<?php

namespace Tests\Unit\UseCases\Library;

use App\Application\DTOs\CreateLoanDTO;
use App\Application\UseCases\Library\CreateLoanUseCase;
use App\Domain\Exceptions\InsufficientStockException;
use App\Domain\Exceptions\MaxLoansExceededException;
use App\Domain\Ports\BookRepositoryInterface;
use App\Domain\Ports\LoanRepositoryInterface;
use App\Domain\Ports\MemberRepositoryInterface;
use App\Models\Adherent;
use App\Models\Etablissement;
use App\Models\Livre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CreateLoanUseCaseTest extends TestCase
{
    use RefreshDatabase;

    private CreateLoanUseCase $useCase;
    private Etablissement $etablissement;
    private User $studentUser;
    private Adherent $adherent;
    private Livre $book;

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

        // Adherent links to Eleve (using user_id/user_type)
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
            'quantite_stock' => 5,
            'etablissement_id' => $this->etablissement->id,
        ]);

        // Resolve dependencies from container
        $this->useCase = new CreateLoanUseCase(
            $this->app->make(BookRepositoryInterface::class),
            $this->app->make(LoanRepositoryInterface::class),
            $this->app->make(MemberRepositoryInterface::class)
        );

        // Seed default library settings
        DB::table('library_settings')->insert([
            [
                'etablissement_id' => $this->etablissement->id,
                'key' => 'max_loans_per_member',
                'value' => json_encode(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'etablissement_id' => $this->etablissement->id,
                'key' => 'loan_duration_days',
                'value' => json_encode(14),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    public function test_throws_insufficient_stock_exception_when_stock_is_zero(): void
    {
        // Set stock to 0
        $this->book->update(['quantite_stock' => 0]);

        $dto = CreateLoanDTO::fromArray([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
        ]);

        $this->expectException(InsufficientStockException::class);
        $this->useCase->execute($dto, $this->etablissement->id);
    }

    public function test_throws_max_loans_exceeded_exception_when_limit_reached(): void
    {
        // Create 2 active loans (which is the limit we seeded: 2)
        for ($i = 0; $i < 2; $i++) {
            DB::table('emprunts')->insert([
                'livre_id' => $this->book->id,
                'adherent_id' => $this->adherent->id,
                'date_emprunt' => now()->toDateString(),
                'date_retour_prevue' => now()->addDays(14)->toDateString(),
                'statut' => 'en_cours',
                'etablissement_id' => $this->etablissement->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $dto = CreateLoanDTO::fromArray([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
        ]);

        $this->expectException(MaxLoansExceededException::class);
        $this->useCase->execute($dto, $this->etablissement->id);
    }

    public function test_successfully_creates_loan_and_decrements_stock(): void
    {
        $dto = CreateLoanDTO::fromArray([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
        ]);

        $loan = $this->useCase->execute($dto, $this->etablissement->id);

        $this->assertNotNull($loan);
        $this->assertEquals($this->book->id, $loan->livre_id);
        $this->assertEquals($this->adherent->id, $loan->adherent_id);
        $this->assertEquals('en_cours', $loan->statut);

        // Verify stock was decremented (5 -> 4)
        $this->assertDatabaseHas('livres', [
            'id' => $this->book->id,
            'quantite_stock' => 4,
        ]);

        // Verify loan exists in DB
        $this->assertDatabaseHas('emprunts', [
            'id' => $loan->id,
            'statut' => 'en_cours',
        ]);
    }
}
