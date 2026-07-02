<?php

namespace App\Application\DTOs;

class ProposeExamScheduleDTO
{
    public string $intitule;
    public int $classe_id;
    public int $matiere_id;
    public string $date_proposee;

    public function __construct(array $data)
    {
        $this->intitule = $data['intitule'];
        $this->classe_id = (int)$data['classe_id'];
        $this->matiere_id = (int)$data['matiere_id'];
        $this->date_proposee = $data['date_proposee'];
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
        ];
    }
}
