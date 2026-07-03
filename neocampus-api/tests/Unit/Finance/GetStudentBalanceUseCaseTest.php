<?php

namespace Tests\Unit\Finance;

use App\Application\UseCases\GetStudentBalanceUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Ports\StudentPortInterface;
use App\Domain\Exceptions\FinanceException;
use Tests\TestCase;

class GetStudentBalanceUseCaseTest extends TestCase
{
    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    public function test_retrieves_student_balance_successfully(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);
        $studentPort = \Mockery::mock(StudentPortInterface::class);

        $studentPort->shouldReceive('findById')
            ->once()
            ->with(5)
            ->andReturn([
                'id' => 5,
                'nom' => 'El Alami',
                'prenom' => 'Fatima',
                'matricule' => 'STU100'
            ]);

        $feePort->shouldReceive('findAll')
            ->once()
            ->with(['eleve_id' => 5])
            ->andReturn([
                [
                    'id' => 200,
                    'type_frais_id' => 10,
                    'eleve_id' => 5,
                    'montant' => 600.00,
                    'date_echeance' => '2026-09-01',
                    'statut' => 'en_attente',
                    'remises' => [],
                    'penalites' => [],
                    'paiements' => []
                ]
            ]);

        $soldePort->shouldReceive('findByStudent')
            ->once()
            ->with(5)
            ->andReturn([
                'id' => 1,
                'eleve_id' => 5,
                'montant_du' => 600.00,
                'montant_paye' => 0.00,
                'montant_restant' => 600.00,
                'updated_at' => '2026-07-02 12:00:00'
            ]);

        $useCase = new GetStudentBalanceUseCase($feePort, $soldePort, $studentPort);
        $result = $useCase->execute(5);

        $this->assertEquals('Fatima', $result['student']['prenom']);
        $this->assertCount(1, $result['fees']);
        $this->assertEquals(600.00, $result['solde']['montant_restant']);
    }

    public function test_throws_exception_if_student_not_found(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);
        $studentPort = \Mockery::mock(StudentPortInterface::class);

        $studentPort->shouldReceive('findById')
            ->once()
            ->with(99)
            ->andReturn(null);

        $useCase = new GetStudentBalanceUseCase($feePort, $soldePort, $studentPort);

        $this->expectException(FinanceException::class);
        $this->expectExceptionMessage("Student ID 99 not found.");

        $useCase->execute(99);
    }
}
