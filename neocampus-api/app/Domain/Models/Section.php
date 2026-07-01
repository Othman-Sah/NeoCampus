<?php

namespace App\Domain\Models;

class Section
{
    public ?int $id;
    public string $nom;
    public int $etablissement_id;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->nom = $data['nom'] ?? '';
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'etablissement_id' => $this->etablissement_id,
        ];
    }
}
