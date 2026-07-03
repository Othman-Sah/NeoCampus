<?php

namespace App\Domain\Models;

class Paiement
{
    public ?int $id;
    public int $frais_id;
    public float $montant_paye;
    public string $date_paiement;
    public string $mode;
    public ?string $reference;
    public ?int $comptable_id;
    public int $etablissement_id;
    public ?array $comptable;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->frais_id = $data['frais_id'] ?? 0;
        $this->montant_paye = (float) ($data['montant_paye'] ?? 0.0);
        $this->date_paiement = $data['date_paiement'] ?? '';
        $this->mode = $data['mode'] ?? 'cash';
        $this->reference = $data['reference'] ?? null;
        $this->comptable_id = $data['comptable_id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->comptable = $data['comptable'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'frais_id' => $this->frais_id,
            'montant_paye' => $this->montant_paye,
            'date_paiement' => $this->date_paiement,
            'mode' => $this->mode,
            'reference' => $this->reference,
            'comptable_id' => $this->comptable_id,
            'etablissement_id' => $this->etablissement_id,
            'comptable' => $this->comptable,
        ];
    }
}
