<?php

namespace App\Domain\Models;

class Penalite
{
    public ?int $id;
    public int $frais_id;
    public float $montant;
    public ?string $motif;
    public ?int $applique_par;
    public ?array $user;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->frais_id = $data['frais_id'] ?? 0;
        $this->montant = (float) ($data['montant'] ?? 0.0);
        $this->motif = $data['motif'] ?? null;
        $this->applique_par = $data['applique_par'] ?? null;
        $this->user = $data['user'] ?? null;
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
            'montant' => $this->montant,
            'motif' => $this->motif,
            'applique_par' => $this->applique_par,
            'user' => $this->user,
        ];
    }
}
