<?php

namespace App\Application\DTOs;

class CreateLoanDTO
{
    public int $livre_id;
    public int $adherent_id;

    public function __construct(array $data)
    {
        $this->livre_id = (int) $data['livre_id'];
        $this->adherent_id = (int) $data['adherent_id'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'livre_id' => $this->livre_id,
            'adherent_id' => $this->adherent_id,
        ];
    }
}
