<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class RecordPaymentDTO
{
    public int $frais_id;
    public float $montant_paye;
    public string $date_paiement;
    public string $mode;
    public ?string $reference;

    public function __construct(int $frais_id, float $montant_paye, string $date_paiement, string $mode, ?string $reference)
    {
        $this->frais_id = $frais_id;
        $this->montant_paye = $montant_paye;
        $this->date_paiement = $date_paiement;
        $this->mode = $mode;
        $this->reference = $reference;
    }

    public static function fromRequest(array $data): self
    {
        if (empty($data['frais_id'])) {
            throw new FinanceException("The fee ID (frais_id) is required.", 422);
        }

        $montant_paye = isset($data['montant_paye']) ? (float) $data['montant_paye'] : 0.0;
        if ($montant_paye <= 0) {
            throw new FinanceException("The paid amount must be greater than zero.", 422);
        }

        if (empty($data['date_paiement'])) {
            throw new FinanceException("The payment date (date_paiement) is required.", 422);
        }

        $mode = $data['mode'] ?? '';
        if (!in_array($mode, ['cash', 'virement', 'cheque'])) {
            throw new FinanceException("The payment mode must be one of: cash, virement, cheque.", 422);
        }

        return new self(
            (int) $data['frais_id'],
            $montant_paye,
            $data['date_paiement'],
            $mode,
            $data['reference'] ?? null
        );
    }
}
