<?php

namespace App\Application\DTOs;

class CreateStudentDTO
{
    public string $nom;
    public string $prenom;
    public ?string $email;
    public ?string $matricule;
    public ?int $classe_id;
    public ?string $classe_nom;
    public ?string $sexe;
    public ?string $date_naissance;
    public ?array $parent_contact;
    public ?array $documents;
    public ?string $scolarite_anterieure;
    public ?string $status;

    public function __construct(array $data)
    {
        $this->nom = $data['nom'];
        $this->prenom = $data['prenom'];
        $this->email = $data['email'] ?? null;
        $this->matricule = $data['matricule'] ?? null;
        $this->classe_id = $data['classe_id'] ?? null;
        $this->classe_nom = $data['classe_nom'] ?? null;
        $this->sexe = $data['sexe'] ?? null;
        $this->date_naissance = $data['date_naissance'] ?? null;
        $this->parent_contact = $data['parent_contact'] ?? null;
        $this->documents = $data['documents'] ?? null;
        $this->scolarite_anterieure = $data['scolarite_anterieure'] ?? null;
        $this->status = $data['status'] ?? 'Actif';
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
            'email' => $this->email,
            'matricule' => $this->matricule,
            'classe_id' => $this->classe_id,
            'classe_nom' => $this->classe_nom,
            'sexe' => $this->sexe,
            'date_naissance' => $this->date_naissance,
            'parent_contact' => $this->parent_contact,
            'documents' => $this->documents,
            'scolarite_anterieure' => $this->scolarite_anterieure,
            'status' => $this->status,
        ];
    }
}
