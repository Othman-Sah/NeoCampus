<?php

namespace App\Application\DTOs;

class PresenceEntryDTO
{
    public int $eleve_id;
    public string $statut;
    public ?string $motif;

    public function __construct(array $data)
    {
        $this->eleve_id = (int)$data['eleve_id'];
        $this->statut = $data['statut'];
        $this->motif = $data['motif'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'eleve_id' => $this->eleve_id,
            'statut' => $this->statut,
            'motif' => $this->motif,
        ];
    }
}
