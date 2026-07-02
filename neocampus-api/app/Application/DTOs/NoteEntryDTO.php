<?php

namespace App\Application\DTOs;

class NoteEntryDTO
{
    public int $eleve_id;
    public float $valeur;

    public function __construct(array $data)
    {
        $this->eleve_id = (int)$data['eleve_id'];
        $this->valeur = (float)$data['valeur'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'eleve_id' => $this->eleve_id,
            'valeur' => $this->valeur,
        ];
    }
}
