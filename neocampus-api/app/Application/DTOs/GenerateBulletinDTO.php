<?php

namespace App\Application\DTOs;

class GenerateBulletinDTO
{
    public int $classe_id;
    public string $periode;

    public function __construct(array $data)
    {
        $this->classe_id = (int)$data['classe_id'];
        $this->periode = $data['periode'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'classe_id' => $this->classe_id,
            'periode' => $this->periode,
        ];
    }
}
