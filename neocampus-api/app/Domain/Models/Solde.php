<?php

namespace App\Domain\Models;

class Solde
{
    public ?int $id;
    public int $eleve_id;
    public int $etablissement_id;
    public float $montant_du;
    public float $montant_paye;
    public float $montant_restant;
    public string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->eleve_id = $data['eleve_id'] ?? 0;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->montant_du = (float) ($data['montant_du'] ?? 0.0);
        $this->montant_paye = (float) ($data['montant_paye'] ?? 0.0);
        $this->montant_restant = (float) ($data['montant_restant'] ?? ($this->montant_du - $this->montant_paye));
        $this->updated_at = $data['updated_at'] ?? '';
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'eleve_id' => $this->eleve_id,
            'etablissement_id' => $this->etablissement_id,
            'montant_du' => $this->montant_du,
            'montant_paye' => $this->montant_paye,
            'montant_restant' => $this->montant_restant,
            'updated_at' => $this->updated_at,
        ];
    }
}
