<?php

namespace App\Domain\Models;

class Member
{
    public ?int $id;
    public int $user_id;
    public string $user_type;
    public int $etablissement_id;
    public ?string $created_at;
    public ?string $updated_at;

    // Optional user details (full name, email, role, etc.)
    public ?array $user_details;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->user_id = $data['user_id'] ?? 0;
        $this->user_type = $data['user_type'] ?? '';
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
        $this->user_details = $data['user_details'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user_type' => $this->user_type,
            'etablissement_id' => $this->etablissement_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user_details' => $this->user_details,
        ];
    }
}
