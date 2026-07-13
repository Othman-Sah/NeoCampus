<?php

namespace App\Domain\Models;

class Chauffeur
{
    public ?int $id;
    public int $etablissement_id;
    public string $nom;
    public string $prenom;
    public ?string $telephone;
    public string $num_permis;
    public ?int $vehicule_id;
    public ?int $user_id;
    public string $statut;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->nom = $data['nom'] ?? '';
        $this->prenom = $data['prenom'] ?? '';
        $this->telephone = $data['telephone'] ?? null;
        $this->num_permis = $data['num_permis'] ?? '';
        $this->vehicule_id = $data['vehicule_id'] ?? null;
        $this->user_id = $data['user_id'] ?? null;
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
            'prenom' => $this->prenom,
            'telephone' => $this->telephone,
            'num_permis' => $this->num_permis,
            'vehicule_id' => $this->vehicule_id,
            'user_id' => $this->user_id,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
