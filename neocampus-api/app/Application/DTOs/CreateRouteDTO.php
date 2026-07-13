<?php

namespace App\Application\DTOs;

class CreateRouteDTO
{
    public string $nom;
    public string $zone;
    public ?string $description;
    public ?int $vehicule_id;
    public ?string $heure_depart;
    public ?string $heure_retour;
    public string $statut;

    public function __construct(array $data)
    {
        $this->nom = $data['nom'];
        $this->zone = $data['zone'];
        $this->description = $data['description'] ?? null;
        $this->vehicule_id = isset($data['vehicule_id']) ? (int)$data['vehicule_id'] : null;
        $this->heure_depart = $data['heure_depart'] ?? null;
        $this->heure_retour = $data['heure_retour'] ?? null;
        $this->statut = $data['statut'] ?? 'actif';
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'nom' => $this->nom,
            'zone' => $this->zone,
            'description' => $this->description,
            'vehicule_id' => $this->vehicule_id,
            'heure_depart' => $this->heure_depart,
            'heure_retour' => $this->heure_retour,
            'statut' => $this->statut,
        ];
    }
}
