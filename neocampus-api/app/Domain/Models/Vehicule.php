<?php

namespace App\Domain\Models;

class Vehicule
{
    public ?int $id;
    public int $etablissement_id;
    public string $matricule;
    public string $marque;
    public ?string $modele;
    public int $capacite;
    public string $statut;
    public ?int $annee_mise_en_service;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->matricule = $data['matricule'] ?? '';
        $this->marque = $data['marque'] ?? '';
        $this->modele = $data['modele'] ?? null;
        $this->capacite = $data['capacite'] ?? 0;
        $this->statut = $data['statut'] ?? 'actif';
        $this->annee_mise_en_service = $data['annee_mise_en_service'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'etablissement_id' => $this->etablissement_id,
            'matricule' => $this->matricule,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'capacite' => $this->capacite,
            'statut' => $this->statut,
            'annee_mise_en_service' => $this->annee_mise_en_service,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
