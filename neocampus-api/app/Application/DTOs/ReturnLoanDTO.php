<?php

namespace App\Application\DTOs;

class ReturnLoanDTO
{
    public int $id;

    public function __construct(array $data)
    {
        $this->id = (int) $data['id'];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
        ];
    }
}
