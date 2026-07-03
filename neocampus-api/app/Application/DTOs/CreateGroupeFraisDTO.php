<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class CreateGroupeFraisDTO
{
    public string $nom;
    public ?string $description;

    public function __construct(string $nom, ?string $description)
    {
        $this->nom = $nom;
        $this->description = $description;
    }

    public static function fromRequest(array $data): self
    {
        $nom = $data['nom'] ?? '';
        if (empty(trim($nom))) {
            throw new FinanceException("The group name (nom) is required.", 422);
        }

        return new self(
            trim($nom),
            $data['description'] ?? null
        );
    }
}
