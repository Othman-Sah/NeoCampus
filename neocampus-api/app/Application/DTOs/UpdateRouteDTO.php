<?php

namespace App\Application\DTOs;

class UpdateRouteDTO
{
    public ?string $nom;
    public ?string $zone;
    public ?string $description;
    public ?int $vehicule_id;
    public ?string $heure_depart;
    public ?string $heure_retour;
    public ?string $statut;

    private array $presentFields = [];

    public function __construct(array $data)
    {
        $this->nom = $data['nom'] ?? null;
        $this->zone = $data['zone'] ?? null;
        $this->description = $data['description'] ?? null;
        $this->vehicule_id = isset($data['vehicule_id']) ? (int)$data['vehicule_id'] : null;
        $this->heure_depart = $data['heure_depart'] ?? null;
        $this->heure_retour = $data['heure_retour'] ?? null;
        $this->statut = $data['statut'] ?? null;

        foreach ($data as $key => $val) {
            $this->presentFields[] = $key;
        }
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        $result = [];
        if (in_array('nom', $this->presentFields)) $result['nom'] = $this->nom;
        if (in_array('zone', $this->presentFields)) $result['zone'] = $this->zone;
        if (in_array('description', $this->presentFields)) $result['description'] = $this->description;
        if (in_array('vehicule_id', $this->presentFields)) $result['vehicule_id'] = $this->vehicule_id;
        if (in_array('heure_depart', $this->presentFields)) $result['heure_depart'] = $this->heure_depart;
        if (in_array('heure_retour', $this->presentFields)) $result['heure_retour'] = $this->heure_retour;
        if (in_array('statut', $this->presentFields)) $result['statut'] = $this->statut;
        return $result;
    }
}
