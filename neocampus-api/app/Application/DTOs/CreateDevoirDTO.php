<?php

namespace App\Application\DTOs;

class CreateDevoirDTO
{
    public int $classe_id;
    public int $matiere_id;
    public string $titre;
    public ?string $description;
    public string $date_echeance;
    public ?string $fichier_url;
    public ?int $enseignant_id;
    public ?int $etablissement_id;

    public function __construct(array $data)
    {
        $this->classe_id = (int)$data['classe_id'];
        $this->matiere_id = (int)$data['matiere_id'];
        $this->titre = $data['titre'];
        $this->description = $data['description'] ?? null;
        $this->date_echeance = $data['date_echeance'];
        $this->fichier_url = $data['fichier_url'] ?? null;
        $this->enseignant_id = isset($data['enseignant_id']) ? (int)$data['enseignant_id'] : null;
        $this->etablissement_id = isset($data['etablissement_id']) ? (int)$data['etablissement_id'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'classe_id' => $this->classe_id,
            'matiere_id' => $this->matiere_id,
            'titre' => $this->titre,
            'description' => $this->description,
            'date_echeance' => $this->date_echeance,
            'fichier_url' => $this->fichier_url,
            'enseignant_id' => $this->enseignant_id,
            'etablissement_id' => $this->etablissement_id,
        ];
    }
}
