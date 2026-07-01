<?php

namespace App\Application\DTOs;

class SeanceDTO
{
    public string $jour;
    public string $heure_debut;
    public string $heure_fin;
    public int $classe_id;
    public int $enseignant_id;
    public int $matiere_id;
    public ?int $etablissement_id;

    public function __construct(array $data)
    {
        $this->jour = $data['jour'];
        $this->heure_debut = $data['heure_debut'];
        $this->heure_fin = $data['heure_fin'];
        $this->classe_id = (int)$data['classe_id'];
        $this->enseignant_id = (int)$data['enseignant_id'];
        $this->matiere_id = (int)$data['matiere_id'];
        $this->etablissement_id = isset($data['etablissement_id']) ? (int)$data['etablissement_id'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'jour' => $this->jour,
            'heure_debut' => $this->heure_debut,
            'heure_fin' => $this->heure_fin,
            'classe_id' => $this->classe_id,
            'enseignant_id' => $this->enseignant_id,
            'matiere_id' => $this->matiere_id,
            'etablissement_id' => $this->etablissement_id,
        ];
    }
}
