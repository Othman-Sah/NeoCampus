<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class CreateRecetteDepenseDTO
{
    public string $libelle;
    public float $montant;
    public string $type;
    public ?string $categorie;
    public string $date;
    public ?string $justificatif;

    public function __construct(string $libelle, float $montant, string $type, ?string $categorie, string $date, ?string $justificatif)
    {
        $this->libelle = $libelle;
        $this->montant = $montant;
        $this->type = $type;
        $this->categorie = $categorie;
        $this->date = $date;
        $this->justificatif = $justificatif;
    }

    public static function fromRequest(array $data): self
    {
        $libelle = $data['libelle'] ?? '';
        if (empty(trim($libelle))) {
            throw new FinanceException("The description (libelle) is required.", 422);
        }

        $montant = isset($data['montant']) ? (float) $data['montant'] : 0.0;
        if ($montant <= 0) {
            throw new FinanceException("The amount must be greater than zero.", 422);
        }

        $type = $data['type'] ?? '';
        if (!in_array($type, ['recette', 'depense'])) {
            throw new FinanceException("The type must be 'recette' or 'depense'.", 422);
        }

        if (empty($data['date'])) {
            throw new FinanceException("The date is required.", 422);
        }

        return new self(
            trim($libelle),
            $montant,
            $type,
            $data['categorie'] ?? null,
            $data['date'],
            $data['justificatif'] ?? null
        );
    }
}
