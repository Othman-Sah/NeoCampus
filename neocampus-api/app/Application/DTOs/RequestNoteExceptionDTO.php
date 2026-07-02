<?php

namespace App\Application\DTOs;

class RequestNoteExceptionDTO
{
    public int $examen_id;
    public string $motif;

    public function __construct(array $data)
    {
        $this->examen_id = (int)$data['examen_id'];
        $this->motif = $data['motif'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'examen_id' => $this->examen_id,
            'motif' => $this->motif,
        ];
    }
}
