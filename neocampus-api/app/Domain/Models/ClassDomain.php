<?php

namespace App\Domain\Models;

class ClassDomain
{
    public ?int $id;
    public string $nom;
    public ?string $niveau;
    public int $section_id;
    public int $annee_scolaire_id;
    public int $etablissement_id;
    public ?int $students_count;
    public ?int $teachers_count;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->nom = $data['nom'] ?? '';
        $this->niveau = $data['niveau'] ?? null;
        $this->section_id = $data['section_id'] ?? 0;
        $this->annee_scolaire_id = $data['annee_scolaire_id'] ?? 0;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->students_count = $data['students_count'] ?? 0;
        $this->teachers_count = $data['teachers_count'] ?? 0;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'niveau' => $this->niveau,
            'section_id' => $this->section_id,
            'annee_scolaire_id' => $this->annee_scolaire_id,
            'etablissement_id' => $this->etablissement_id,
            'students_count' => $this->students_count,
            'teachers_count' => $this->teachers_count,
        ];
    }
}
