<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class ApplyPenaliteDTO
{
    public int $frais_id;
    public float $montant;
    public ?string $motif;

    public function __construct(int $frais_id, float $montant, ?string $motif)
    {
        $this->frais_id = $frais_id;
        $this->montant = $montant;
        $this->motif = $motif;
    }

    public static function fromRequest(array $data): self
    {
        $frais_id = isset($data['frais_id']) ? (int) $data['frais_id'] : 0;
        if (!$frais_id) {
            throw new FinanceException("The fee ID is required.", 422);
        }

        $montant = isset($data['montant']) ? (float) $data['montant'] : 0.0;
        if ($montant <= 0) {
            throw new FinanceException("The penalty amount must be greater than zero.", 422);
        }

        return new self(
            $frais_id,
            $montant,
            $data['motif'] ?? null
        );
    }
}
