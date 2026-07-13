<?php

namespace App\Application\DTOs;

class CreateVehicleDTO
{
    public string $matricule;
    public string $marque;
    public ?string $modele;
    public int $capacite;
    public string $statut;
    public ?int $annee_mise_en_service;

    public function __construct(array $data)
    {
        $this->matricule = $data['matricule'];
        $this->marque = $data['marque'];
        $this->modele = $data['modele'] ?? null;
        $this->capacite = (int)$data['capacite'];
        $this->statut = $data['statut'] ?? 'actif';
        $this->annee_mise_en_service = isset($data['annee_mise_en_service']) ? (int)$data['annee_mise_en_service'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'matricule' => $this->matricule,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'capacite' => $this->capacite,
            'statut' => $this->statut,
            'annee_mise_en_service' => $this->annee_mise_en_service,
        ];
    }
}
