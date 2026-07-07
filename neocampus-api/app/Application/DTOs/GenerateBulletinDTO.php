<?php

namespace App\Application\DTOs;

class GenerateBulletinDTO
{
    public int $classe_id;
    public string $periode;
    public string $annee_scolaire;

    public function __construct(array $data)
    {
        $this->classe_id = (int) $data['classe_id'];
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
            'classe_id' => $this->classe_id,
            'periode' => $this->periode,
            'annee_scolaire' => $this->annee_scolaire,
        ];
    }
}
