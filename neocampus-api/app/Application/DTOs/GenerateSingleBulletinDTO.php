<?php

namespace App\Application\DTOs;

class GenerateSingleBulletinDTO
{
    public int $eleve_id;
    public string $periode;
    public string $annee_scolaire;

    public function __construct(array $data)
    {
        $this->eleve_id = (int) $data['eleve_id'];
        $this->periode = $data['periode'];
        $this->annee_scolaire = $data['annee_scolaire'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'eleve_id' => $this->eleve_id,
            'periode' => $this->periode,
            'annee_scolaire' => $this->annee_scolaire,
        ];
    }
}
