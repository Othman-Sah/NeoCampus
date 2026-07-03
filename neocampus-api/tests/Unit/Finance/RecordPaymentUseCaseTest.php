<?php

namespace Tests\Unit\Finance;

use App\Application\DTOs\RecordPaymentDTO;
use App\Application\UseCases\RecordPaymentUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use App\Domain\Ports\FinancePaymentPortInterface;
use App\Domain\Ports\FinanceSoldePortInterface;
use App\Domain\Exceptions\FinanceException;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class RecordPaymentUseCaseTest extends TestCase
{
    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    public function test_records_payment_and_updates_status(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $paymentPort = \Mockery::mock(FinancePaymentPortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);

        $dto = new RecordPaymentDTO(100, 300.00, '2026-07-02', 'cash', 'TX123');

        // Create a real model instance instead of a mock to avoid offsetExists expectations
        $user = new \App\Models\User([
            'etablissement_id' => 1
        ]);
        $user->id = 2;
        $user->role = 'comptable';

        Auth::shouldReceive('user')->andReturn($user);
        Auth::shouldReceive('id')->andReturn(2);

        $feePort->shouldReceive('findById')
            ->once()
            ->with(100)
            ->andReturn([
                'id' => 100,
                'eleve_id' => 10,
                'etablissement_id' => 1,
                'montant' => 500.00,
                'date_echeance' => '2026-09-01',
                'statut' => 'en_attente',
                'remises' => [],
                'penalites' => [],
                'paiements' => []
            ]);

        $paymentPort->shouldReceive('create')
            ->once()
            ->with([
                'frais_id' => 100,
                'montant_paye' => 300.00,
                'date_paiement' => '2026-07-02',
                'mode' => 'cash',
                'reference' => 'TX123',
                'comptable_id' => 2,
                'etablissement_id' => 1
            ])
            ->andReturn([
                'id' => 50,
                'frais_id' => 100,
                'montant_paye' => 300.00,
                'date_paiement' => '2026-07-02',
                'mode' => 'cash',
                'reference' => 'TX123'
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
                    'montant' => 500.00,
                    'date_echeance' => '2026-09-01',
                    'statut' => 'en_attente',
                    'remises' => [],
                    'penalites' => [],
                    'paiements' => [
                        ['montant_paye' => 300.00]
                    ]
                ]
            ]);

        $soldePort->shouldReceive('createOrUpdate')
            ->once()
            ->with(10, [
                'montant_du' => 500.00,
                'montant_paye' => 300.00
            ])
            ->andReturn([]);

        $useCase = new RecordPaymentUseCase($feePort, $paymentPort, $soldePort);
        $result = $useCase->execute($dto);

        $this->assertEquals(50, $result['id']);
    }

    public function test_payment_exceeding_remaining_fails(): void
    {
        $feePort = \Mockery::mock(FinanceFeePortInterface::class);
        $paymentPort = \Mockery::mock(FinancePaymentPortInterface::class);
        $soldePort = \Mockery::mock(FinanceSoldePortInterface::class);

        $dto = new RecordPaymentDTO(100, 600.00, '2026-07-02', 'cash', 'TX123');

        $feePort->shouldReceive('findById')
            ->once()
            ->with(100)
            ->andReturn([
                'id' => 100,
                'eleve_id' => 10,
                'etablissement_id' => 1,
                'montant' => 500.00,
                'date_echeance' => '2026-09-01',
                'statut' => 'en_attente',
                'remises' => [],
                'penalites' => [],
                'paiements' => []
            ]);

        $useCase = new RecordPaymentUseCase($feePort, $paymentPort, $soldePort);

        $this->expectException(FinanceException::class);
        $this->expectExceptionMessage("Le montant payé dépasse le solde restant");

        $useCase->execute($dto);
    }
}
