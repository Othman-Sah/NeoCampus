<?php

namespace App\Domain\Models;

/**
 * Value object representing a single class+subject assignment for a teacher.
 */
final readonly class TeacherClassAssignment
{
    public function __construct(
        public int     $classe_id,
        public ?string $classe_nom,
        public ?string $niveau,
        public int     $matiere_id,
        public ?string $matiere_nom,
    ) {}

    public function toArray(): array
    {
        return [
            'classe_id' => $this->classe_id,
            'classe_nom' => $this->classe_nom,
            'niveau' => $this->niveau,
            'matiere_id' => $this->matiere_id,
            'matiere_nom' => $this->matiere_nom,
        ];
    }
}
