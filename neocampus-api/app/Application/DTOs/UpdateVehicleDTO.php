<?php

namespace App\Application\DTOs;

class UpdateVehicleDTO
{
    public ?string $matricule;
    public ?string $marque;
    public ?string $modele;
    public ?int $capacite;
    public ?string $statut;
    public ?int $annee_mise_en_service;

    public function __construct(array $data)
    {
        $this->matricule = $data['matricule'] ?? null;
        $this->marque = $data['marque'] ?? null;
        $this->modele = $data['modele'] ?? null;
        $this->capacite = isset($data['capacite']) ? (int)$data['capacite'] : null;
        $this->statut = $data['statut'] ?? null;
        $this->annee_mise_en_service = isset($data['annee_mise_en_service']) ? (int)$data['annee_mise_en_service'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        $result = [];
        if ($this->matricule !== null) $result['matricule'] = $this->matricule;
        if ($this->marque !== null) $result['marque'] = $this->marque;
        if ($this->modele !== null) $result['modele'] = $this->modele;
        if ($this->capacite !== null) $result['capacite'] = $this->capacite;
        if ($this->statut !== null) $result['statut'] = $this->statut;
        if ($this->annee_mise_en_service !== null) $result['annee_mise_en_service'] = $this->annee_mise_en_service;
        return $result;
    }
}
