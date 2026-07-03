<?php

namespace App\Domain\Models;

class GroupeFrais
{
    public ?int $id;
    public string $nom;
    public ?string $description;
    public int $etablissement_id;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->nom = $data['nom'] ?? '';
        $this->description = $data['description'] ?? null;
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
            'description' => $this->description,
            'etablissement_id' => $this->etablissement_id,
        ];
    }
}
