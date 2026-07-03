<?php

namespace App\Domain\Models;

class RecetteDepense
{
    public ?int $id;
    public string $libelle;
    public float $montant;
    public string $type;
    public ?string $categorie;
    public string $date;
    public ?string $justificatif;
    public ?int $saisie_par;
    public int $etablissement_id;
    public ?array $saisie_par_user;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->libelle = $data['libelle'] ?? '';
        $this->montant = (float) ($data['montant'] ?? 0.0);
        $this->type = $data['type'] ?? 'recette';
        $this->categorie = $data['categorie'] ?? null;
        $this->date = $data['date'] ?? '';
        $this->justificatif = $data['justificatif'] ?? null;
        $this->saisie_par = $data['saisie_par'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->saisie_par_user = $data['saisie_par_user'] ?? null;
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
            'montant' => $this->montant,
            'type' => $this->type,
            'categorie' => $this->categorie,
            'date' => $this->date,
            'justificatif' => $this->justificatif,
            'saisie_par' => $this->saisie_par,
            'etablissement_id' => $this->etablissement_id,
            'saisie_par_user' => $this->saisie_par_user,
        ];
    }
}
