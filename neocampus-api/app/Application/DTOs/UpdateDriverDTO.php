<?php

namespace App\Application\DTOs;

class UpdateDriverDTO
{
    public ?string $nom;
    public ?string $prenom;
    public ?string $telephone;
    public ?string $num_permis;
    public ?int $vehicule_id;
    public ?int $user_id;
    public ?string $statut;

    private array $presentFields = [];

    public function __construct(array $data)
    {
        $this->nom = $data['nom'] ?? null;
        $this->prenom = $data['prenom'] ?? null;
        $this->telephone = $data['telephone'] ?? null;
        $this->num_permis = $data['num_permis'] ?? null;
        $this->vehicule_id = isset($data['vehicule_id']) ? (int)$data['vehicule_id'] : null;
        $this->user_id = isset($data['user_id']) ? (int)$data['user_id'] : null;
        $this->statut = $data['statut'] ?? null;

        // Keep track of what was explicitly passed
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
        if (in_array('prenom', $this->presentFields)) $result['prenom'] = $this->prenom;
        if (in_array('telephone', $this->presentFields)) $result['telephone'] = $this->telephone;
        if (in_array('num_permis', $this->presentFields)) $result['num_permis'] = $this->num_permis;
        if (in_array('vehicule_id', $this->presentFields)) $result['vehicule_id'] = $this->vehicule_id;
        if (in_array('user_id', $this->presentFields)) $result['user_id'] = $this->user_id;
        if (in_array('statut', $this->presentFields)) $result['statut'] = $this->statut;
        return $result;
    }
}
