<?php

namespace App\Domain\Models;

class SchoolYear
{
    public ?int $id;
    public string $libelle;
    public string $date_debut;
    public string $date_fin;
    public int $etablissement_id;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->libelle = $data['libelle'] ?? '';
        $this->date_debut = $data['date_debut'] ?? '';
        $this->date_fin = $data['date_fin'] ?? '';
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
            'libelle' => $this->libelle,
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'etablissement_id' => $this->etablissement_id,
        ];
    }
}
