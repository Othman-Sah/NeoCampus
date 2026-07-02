<?php

namespace App\Application\DTOs;

class BulkAttendanceDTO
{
    public int $seance_id;
    public string $date;
    /** @var PresenceEntryDTO[] */
    public array $presences;

    public function __construct(array $data)
    {
        $this->seance_id = (int)$data['seance_id'];
        $this->date = $data['date'];
        
        $this->presences = [];
        if (isset($data['presences']) && is_array($data['presences'])) {
            foreach ($data['presences'] as $p) {
                $this->presences[] = $p instanceof PresenceEntryDTO ? $p : new PresenceEntryDTO($p);
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
            'seance_id' => $this->seance_id,
            'date' => $this->date,
            'presences' => array_map(fn($p) => $p->toArray(), $this->presences),
        ];
    }
}
