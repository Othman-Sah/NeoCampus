<?php

namespace App\Domain\Models;

class Student
{
    public ?int $id;
    public int $etablissement_id;
    public ?int $user_id;
    public string $matricule;
    public string $nom;
    public string $prenom;
    public ?string $email;
    public ?string $sexe;
    public ?string $date_naissance;
    public ?int $classe_id;
    public ?string $classe_nom;
    public string $status;
    public ?array $parent_contact;
    public ?array $documents;
    public ?string $scolarite_anterieure;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->user_id = $data['user_id'] ?? null;
        $this->matricule = $data['matricule'] ?? '';
        $this->nom = $data['nom'] ?? '';
        $this->prenom = $data['prenom'] ?? '';
        $this->email = $data['email'] ?? null;
        $this->sexe = $data['sexe'] ?? null;
        $this->date_naissance = $data['date_naissance'] ?? null;
        $this->classe_id = $data['classe_id'] ?? null;
        $this->classe_nom = $data['classe_nom'] ?? null;
        $this->status = $data['status'] ?? 'Actif';
        $this->parent_contact = $data['parent_contact'] ?? null;
        $this->documents = $data['documents'] ?? null;
        $this->scolarite_anterieure = $data['scolarite_anterieure'] ?? null;
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
            'user_id' => $this->user_id,
            'matricule' => $this->matricule,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'sexe' => $this->sexe,
            'date_naissance' => $this->date_naissance,
            'classe_id' => $this->classe_id,
            'classe_nom' => $this->classe_nom,
            'status' => $this->status,
            'parent_contact' => $this->parent_contact,
            'documents' => $this->documents,
            'scolarite_anterieure' => $this->scolarite_anterieure,
        ];
    }
}
