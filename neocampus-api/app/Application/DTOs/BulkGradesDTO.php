<?php

namespace App\Application\DTOs;

class BulkGradesDTO
{
    public int $examen_id;
    /** @var NoteEntryDTO[] */
    public array $notes;

    public function __construct(array $data)
    {
        $this->examen_id = (int)$data['examen_id'];
        
        $this->notes = [];
        if (isset($data['notes']) && is_array($data['notes'])) {
            foreach ($data['notes'] as $n) {
                $this->notes[] = $n instanceof NoteEntryDTO ? $n : new NoteEntryDTO($n);
            }
        }
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'examen_id' => $this->examen_id,
            'notes' => array_map(fn($n) => $n->toArray(), $this->notes),
        ];
    }
}
