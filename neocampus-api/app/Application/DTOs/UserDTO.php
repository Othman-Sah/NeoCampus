<?php

namespace App\Application\DTOs;

class UserDTO
{
    public int $id;
    public int $etablissement_id;
    public ?int $succursale_id;
    public string $nom;
    public string $prenom;
    public string $email;
    public string $role;
    public ?string $avatar;
    public ?array $etablissement;

    public function __construct(
        int $id,
        int $etablissement_id,
        string $nom,
        string $prenom,
        string $email,
        string $role,
        ?string $avatar = null,
        ?int $succursale_id = null,
        ?array $etablissement = null
    ) {
        $this->id = $id;
        $this->etablissement_id = $etablissement_id;
        $this->nom = $nom;
        $this->prenom = $prenom;
        $this->email = $email;
        $this->role = $role;
        $this->avatar = $avatar;
        $this->succursale_id = $succursale_id;
        $this->etablissement = $etablissement;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'],
            $data['etablissement_id'],
            $data['nom'],
            $data['prenom'],
            $data['email'],
            $data['role'],
            $data['avatar'] ?? null,
            $data['succursale_id'] ?? null,
            $data['etablissement'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'etablissement_id' => $this->etablissement_id,
            'succursale_id' => $this->succursale_id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'etablissement' => $this->etablissement,
        ];
    }
}
