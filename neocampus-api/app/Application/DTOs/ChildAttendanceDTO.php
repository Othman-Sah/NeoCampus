<?php

namespace App\Application\DTOs;

class ChildAttendanceDTO
{
    public string $date;
    public string $statut;
    public ?string $motif;
    public string $matiere_nom;
    public string $heure;
    public bool $justifie;

    public function __construct(array $data)
    {
        $this->date = $data['date'];
        $this->statut = $data['statut'];
        $this->motif = $data['motif'] ?? null;
        $this->matiere_nom = $data['matiere_nom'];
        $this->heure = $data['heure'];
        $this->justifie = (bool)($data['justifie'] ?? false);
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'date' => $this->date,
            'statut' => $this->statut,
            'motif' => $this->motif,
            'matiere_nom' => $this->matiere_nom,
            'heure' => $this->heure,
            'justifie' => $this->justifie,
        ];
    }
}
