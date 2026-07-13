<?php

namespace App\Domain\Models;

class Itineraire
{
    public ?int $id;
    public int $etablissement_id;
    public string $nom;
    public string $zone;
    public ?string $description;
    public ?int $vehicule_id;
    public ?string $heure_depart;
    public ?string $heure_retour;
    public string $statut;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->nom = $data['nom'] ?? '';
        $this->zone = $data['zone'] ?? '';
        $this->description = $data['description'] ?? null;
        $this->vehicule_id = $data['vehicule_id'] ?? null;
        $this->heure_depart = $data['heure_depart'] ?? null;
        $this->heure_retour = $data['heure_retour'] ?? null;
        $this->statut = $data['statut'] ?? 'actif';
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
            'nom' => $this->nom,
            'zone' => $this->zone,
            'description' => $this->description,
            'vehicule_id' => $this->vehicule_id,
            'heure_depart' => $this->heure_depart,
            'heure_retour' => $this->heure_retour,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
