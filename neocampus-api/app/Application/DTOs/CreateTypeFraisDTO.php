<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class CreateTypeFraisDTO
{
    public string $libelle;
    public int $groupe_frais_id;
    public float $montant_par_defaut;

    public function __construct(string $libelle, int $groupe_frais_id, float $montant_par_defaut)
    {
        $this->libelle = $libelle;
        $this->groupe_frais_id = $groupe_frais_id;
        $this->montant_par_defaut = $montant_par_defaut;
    }

    public static function fromRequest(array $data): self
    {
        $libelle = $data['libelle'] ?? '';
        if (empty(trim($libelle))) {
            throw new FinanceException("The label (libelle) is required.", 422);
        }

        $groupe_frais_id = isset($data['groupe_frais_id']) ? (int) $data['groupe_frais_id'] : 0;
        if (!$groupe_frais_id) {
            throw new FinanceException("The group ID (groupe_frais_id) is required.", 422);
        }

        $montant_par_defaut = isset($data['montant_par_defaut']) ? (float) $data['montant_par_defaut'] : 0.00;
        if ($montant_par_defaut < 0) {
            throw new FinanceException("The default amount cannot be negative.", 422);
        }

        return new self(
            trim($libelle),
            $groupe_frais_id,
            $montant_par_defaut
        );
    }
}
