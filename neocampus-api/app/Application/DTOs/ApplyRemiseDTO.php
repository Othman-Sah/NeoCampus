<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class ApplyRemiseDTO
{
    public int $frais_id;
    public float $pourcentage;
    public ?string $motif;

    public function __construct(int $frais_id, float $pourcentage, ?string $motif)
    {
        $this->frais_id = $frais_id;
        $this->pourcentage = $pourcentage;
        $this->motif = $motif;
    }

    public static function fromRequest(array $data): self
    {
        $frais_id = isset($data['frais_id']) ? (int) $data['frais_id'] : 0;
        if (!$frais_id) {
            throw new FinanceException("The fee ID is required.", 422);
        }

        $pourcentage = isset($data['pourcentage']) ? (float) $data['pourcentage'] : -1.0;
        if ($pourcentage < 0 || $pourcentage > 100) {
            throw new FinanceException("The discount percentage must be between 0 and 100.", 422);
        }

        return new self(
            $frais_id,
            $pourcentage,
            $data['motif'] ?? null
        );
    }
}
