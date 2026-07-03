<?php

namespace App\Domain\Models;

class TypeFrais
{
    public ?int $id;
    public string $libelle;
    public int $groupe_frais_id;
    public int $etablissement_id;
    public float $montant_par_defaut;
    public ?array $groupe;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->libelle = $data['libelle'] ?? '';
        $this->groupe_frais_id = $data['groupe_frais_id'] ?? 0;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->montant_par_defaut = (float) ($data['montant_par_defaut'] ?? 0.0);
        $this->groupe = $data['groupe'] ?? null;
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
            'groupe_frais_id' => $this->groupe_frais_id,
            'etablissement_id' => $this->etablissement_id,
            'montant_par_defaut' => $this->montant_par_defaut,
            'groupe' => $this->groupe,
        ];
    }
}
