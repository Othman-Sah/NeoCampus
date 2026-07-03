<?php

namespace Tests\Unit\Finance;

use App\Application\DTOs\ApplyRemiseDTO;
use App\Application\UseCases\ApplyRemiseUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class ApplyRemiseUseCaseTest extends TestCase
{
    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    public function test_applies_remise_successfully(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);

        $dto = new ApplyRemiseDTO(100, 10.00, 'Remise anniversaire');

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

        $feePort->shouldReceive('applyRemise')
            ->once()
            ->with(100, [
                'pourcentage' => 10.00,
                'motif' => 'Remise anniversaire',
                'applique_par' => 2
            ])
            ->andReturn([
                'id' => 1,
                'frais_id' => 100,
                'pourcentage' => 10.00,
                'motif' => 'Remise anniversaire'
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
                    'remises' => [
                        ['pourcentage' => 10.00]
                    ],
                    'penalites' => [],
                    'paiements' => []
                ]
            ]);

        $soldePort->shouldReceive('createOrUpdate')
            ->once()
            ->with(10, [
                'montant_du' => 900.00,
                'montant_paye' => 0.0
            ])
            ->andReturn([]);

        $useCase = new ApplyRemiseUseCase($feePort, $soldePort);
        $result = $useCase->execute($dto);

        $this->assertEquals(1, $result['id']);
    }
}
