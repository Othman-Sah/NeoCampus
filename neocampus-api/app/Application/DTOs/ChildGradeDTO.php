<?php

namespace App\Application\DTOs;

class ChildGradeDTO
{
    public string $matiere_nom;
    public string $examen_intitule;
    public ?float $valeur;
    public string $date;
    public float $coefficient;
    public ?float $classe_average;

    public function __construct(array $data)
    {
        $this->matiere_nom = $data['matiere_nom'];
        $this->examen_intitule = $data['examen_intitule'];
        $this->valeur = isset($data['valeur']) ? (float)$data['valeur'] : null;
        $this->date = $data['date'];
        $this->coefficient = (float)$data['coefficient'];
        $this->classe_average = isset($data['classe_average']) ? (float)$data['classe_average'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'matiere_nom' => $this->matiere_nom,
            'examen_intitule' => $this->examen_intitule,
            'valeur' => $this->valeur,
            'date' => $this->date,
            'coefficient' => $this->coefficient,
            'classe_average' => $this->classe_average,
        ];
    }
}
