<?php

namespace App\Application\DTOs;

class ProposeExamScheduleDTO
{
    public string $intitule;
    public int $classe_id;
    public int $matiere_id;
    public string $date_proposee;
    public ?int $type_evaluation_id;
    public ?float $poids;

    public function __construct(array $data)
    {
        $this->intitule = $data['intitule'];
        $this->classe_id = (int)$data['classe_id'];
        $this->matiere_id = (int)$data['matiere_id'];
        $this->date_proposee = $data['date_proposee'];
        $this->type_evaluation_id = isset($data['type_evaluation_id']) ? (int)$data['type_evaluation_id'] : null;
        $this->poids = isset($data['poids']) ? (float)$data['poids'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'intitule' => $this->intitule,
            'classe_id' => $this->classe_id,
            'matiere_id' => $this->matiere_id,
            'date_proposee' => $this->date_proposee,
            'type_evaluation_id' => $this->type_evaluation_id,
            'poids' => $this->poids,
        ];
    }
}
