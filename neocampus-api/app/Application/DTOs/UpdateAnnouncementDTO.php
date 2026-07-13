<?php

namespace App\Application\DTOs;

class UpdateAnnouncementDTO
{
    public ?string $titre;
    public ?string $contenu;
    public ?string $extrait;
    public ?array $target_roles;
    public ?bool $is_pinned;
    public ?string $published_at;

    private array $presentFields = [];

    public function __construct(array $data)
    {
        $this->titre = $data['titre'] ?? null;
        $this->contenu = $data['contenu'] ?? null;
        $this->extrait = $data['extrait'] ?? null;
        $this->target_roles = $data['target_roles'] ?? null;
        $this->is_pinned = isset($data['is_pinned']) ? (bool)$data['is_pinned'] : null;
        $this->published_at = $data['published_at'] ?? null;

        foreach ($data as $key => $val) {
            $this->presentFields[] = $key;
        }
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        $result = [];
        if (in_array('titre', $this->presentFields)) $result['titre'] = $this->titre;
        if (in_array('contenu', $this->presentFields)) {
            $result['contenu'] = $this->contenu;
            if (!in_array('extrait', $this->presentFields)) {
                $result['extrait'] = strlen($this->contenu) > 150 ? substr(strip_tags($this->contenu), 0, 147) . '...' : strip_tags($this->contenu);
            }
        }
        if (in_array('extrait', $this->presentFields)) $result['extrait'] = $this->extrait;
        if (in_array('target_roles', $this->presentFields)) $result['target_roles'] = $this->target_roles;
        if (in_array('is_pinned', $this->presentFields)) $result['is_pinned'] = $this->is_pinned;
        if (in_array('published_at', $this->presentFields)) $result['published_at'] = $this->published_at;
        return $result;
    }
}
