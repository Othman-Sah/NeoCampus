<?php

namespace Tests\Unit\Finance;

use App\Application\DTOs\AssignFeeDTO;
use App\Application\UseCases\AssignFeesToClassUseCase;
use App\Application\UseCases\AssignFeesToStudentUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Ports\FinanceTypeFraisPortInterface;
use Tests\TestCase;

class AssignFeesToStudentUseCaseTest extends TestCase
{
    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    public function test_assigns_fees_to_single_student(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $typeFraisPort = \Mockery::mock(FinanceTypeFraisPortInterface::class);
        $assignClassUseCase = \Mockery::mock(AssignFeesToClassUseCase::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);

        $dto = new AssignFeeDTO([10], 1, null, '2026-09-01', '2025-2026');

        $typeFraisPort->shouldReceive('findById')
            ->once()
            ->with(10)
            ->andReturn([
                'id' => 10,
                'libelle' => 'Mensuel',
                'montant_par_defaut' => 500.00
            ]);

        $feePort->shouldReceive('create')
            ->once()
            ->with([
                'type_frais_id' => 10,
                'eleve_id' => 1,
                'montant' => 500.00,
                'date_echeance' => '2026-09-01',
                'statut' => 'en_attente',
                'annee_scolaire' => '2025-2026'
            ])
            ->andReturn([
                'id' => 100,
                'type_frais_id' => 10,
                'eleve_id' => 1,
                'montant' => 500.00,
                'date_echeance' => '2026-09-01',
                'statut' => 'en_attente',
                'annee_scolaire' => '2025-2026',
                'remises' => [],
                'penalites' => [],
                'paiements' => []
            ]);

        // Eagerly loading for recalculateStudentSolde
        $feePort->shouldReceive('findAll')
            ->once()
            ->with(['eleve_id' => 1])
            ->andReturn([
                [
                    'id' => 100,
                    'type_frais_id' => 10,
                    'eleve_id' => 1,
                    'montant' => 500.00,
                    'date_echeance' => '2026-09-01',
                    'statut' => 'en_attente',
                    'annee_scolaire' => '2025-2026',
                    'remises' => [],
                    'penalites' => [],
                    'paiements' => []
                ]
            ]);

        $soldePort->shouldReceive('createOrUpdate')
            ->once()
            ->with(1, [
                'montant_du' => 500.00,
                'montant_paye' => 0.0
            ])
            ->andReturn([]);

        $useCase = new AssignFeesToStudentUseCase($feePort, $typeFraisPort, $assignClassUseCase, $soldePort);
        $result = $useCase->execute($dto);

        $this->assertCount(1, $result);
        $this->assertEquals(100, $result[0]['id']);
    }
}
