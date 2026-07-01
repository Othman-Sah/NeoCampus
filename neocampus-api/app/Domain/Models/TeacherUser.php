<?php

namespace App\Domain\Models;

/**
 * Value object representing the user credentials linked to a teacher.
 */
final readonly class TeacherUser
{
    public function __construct(
        public int     $id,
        public int     $etablissement_id,
        public string  $nom,
        public string  $prenom,
        public string  $email,
        public string  $role,
        public ?string $avatar = null,
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'etablissement_id' => $this->etablissement_id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
        ];
    }
}
