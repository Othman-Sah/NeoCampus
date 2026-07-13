<?php

namespace App\Domain\Models;

class Annonce
{
    public ?int $id;
    public int $etablissement_id;
    public int $user_id;
    public string $titre;
    public string $contenu;
    public ?string $extrait;
    public array $target_roles;
    public bool $is_pinned;
    public ?string $published_at;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->user_id = $data['user_id'] ?? 0;
        $this->titre = $data['titre'] ?? '';
        $this->contenu = $data['contenu'] ?? '';
        $this->extrait = $data['extrait'] ?? null;
        $this->target_roles = $data['target_roles'] ?? [];
        $this->is_pinned = (bool)($data['is_pinned'] ?? false);
        $this->published_at = $data['published_at'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'etablissement_id' => $this->etablissement_id,
            'user_id' => $this->user_id,
            'titre' => $this->titre,
            'contenu' => $this->contenu,
            'extrait' => $this->extrait,
            'target_roles' => $this->target_roles,
            'is_pinned' => $this->is_pinned,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
