<?php

namespace App\Application\DTOs;

class CreateDriverDTO
{
    public string $nom;
    public string $prenom;
    public ?string $telephone;
    public string $num_permis;
    public ?int $vehicule_id;
    public ?int $user_id;
    public string $statut;

    public function __construct(array $data)
    {
        $this->nom = $data['nom'];
        $this->prenom = $data['prenom'];
        $this->telephone = $data['telephone'] ?? null;
        $this->num_permis = $data['num_permis'];
        $this->vehicule_id = isset($data['vehicule_id']) ? (int)$data['vehicule_id'] : null;
        $this->user_id = isset($data['user_id']) ? (int)$data['user_id'] : null;
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
            'prenom' => $this->prenom,
            'telephone' => $this->telephone,
            'num_permis' => $this->num_permis,
            'vehicule_id' => $this->vehicule_id,
            'user_id' => $this->user_id,
            'statut' => $this->statut,
        ];
    }
}
