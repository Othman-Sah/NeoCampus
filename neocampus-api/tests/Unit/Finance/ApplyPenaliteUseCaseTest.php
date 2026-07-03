<?php

namespace Tests\Unit\Finance;

use App\Application\DTOs\ApplyPenaliteDTO;
use App\Application\UseCases\ApplyPenaliteUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class ApplyPenaliteUseCaseTest extends TestCase
{
    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    public function test_applies_penalite_successfully(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);

        $dto = new ApplyPenaliteDTO(100, 50.00, 'Pénalité de retard');

        // Create a real model instance instead of a mock to avoid offsetExists expectations
        $user = new \App\Models\User([
            'etablissement_id' => 1
        ]);
        $user->id = 2;
        $user->role = 'comptable';

        Auth::shouldReceive('user')->andReturn($user);
        Auth::shouldReceive('id')->andReturn(2);

        $feePort->shouldReceive('findById')
            ->twice()
            ->with(100)
            ->andReturn([
                'id' => 100,
                'eleve_id' => 10,
                'etablissement_id' => 1,
                'montant' => 1000.00,
                'date_echeance' => '2026-09-01',
                'statut' => 'en_attente',
                'remises' => [],
                'penalites' => [],
                'paiements' => []
            ]);

        $feePort->shouldReceive('applyPenalite')
            ->once()
            ->with(100, [
                'montant' => 50.00,
                'motif' => 'Pénalité de retard',
                'applique_par' => 2
            ])
            ->andReturn([
                'id' => 5,
                'frais_id' => 100,
                'montant' => 50.00,
                'motif' => 'Pénalité de retard'
            ]);

        $feePort->shouldReceive('update')
            ->once()
            ->with(100, ['statut' => 'en_attente'])
            ->andReturn([]);

        $feePort->shouldReceive('findAll')
            ->once()
            ->with(['eleve_id' => 10])
            ->andReturn([
                [
                    'id' => 100,
                    'eleve_id' => 10,
                    'montant' => 1000.00,
                    'date_echeance' => '2026-09-01',
                    'statut' => 'en_attente',
                    'remises' => [],
                    'penalites' => [
                        ['montant' => 50.00]
                    ],
                    'paiements' => []
                ]
            ]);

        $soldePort->shouldReceive('createOrUpdate')
            ->once()
            ->with(10, [
                'montant_du' => 1050.00,
                'montant_paye' => 0.0
            ])
            ->andReturn([]);

        $useCase = new ApplyPenaliteUseCase($feePort, $soldePort);
        $result = $useCase->execute($dto);

        $this->assertEquals(5, $result['id']);
    }
}
