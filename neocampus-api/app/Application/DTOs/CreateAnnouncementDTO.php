<?php

namespace App\Application\DTOs;

class CreateAnnouncementDTO
{
    public string $titre;
    public string $contenu;
    public ?string $extrait;
    public array $target_roles;
    public bool $is_pinned;
    public ?string $published_at;

    public function __construct(array $data)
    {
        $this->titre = $data['titre'];
        $this->contenu = $data['contenu'];
        $this->extrait = $data['extrait'] ?? (strlen($data['contenu']) > 150 ? substr(strip_tags($data['contenu']), 0, 147) . '...' : strip_tags($data['contenu']));
        $this->target_roles = $data['target_roles'] ?? [];
        $this->is_pinned = (bool)($data['is_pinned'] ?? false);
        $this->published_at = $data['published_at'] ?? now()->toDateTimeString();
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'titre' => $this->titre,
            'contenu' => $this->contenu,
            'extrait' => $this->extrait,
            'target_roles' => $this->target_roles,
            'is_pinned' => $this->is_pinned,
            'published_at' => $this->published_at,
        ];
    }
}
