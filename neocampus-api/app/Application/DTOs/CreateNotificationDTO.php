<?php

namespace App\Application\DTOs;

class CreateNotificationDTO
{
    public int $target_user_id;
    public string $type;
    public string $titre;
    public string $contenu;
    public ?string $link;

    public function __construct(array $data)
    {
        $this->target_user_id = (int)$data['target_user_id'];
        $this->type = $data['type'] ?? 'systeme';
        $this->titre = $data['titre'];
        $this->contenu = $data['contenu'];
        $this->link = $data['link'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'target_user_id' => $this->target_user_id,
            'type' => $this->type,
            'titre' => $this->titre,
            'contenu' => $this->contenu,
            'link' => $this->link,
            'is_read' => false,
            'date_envoi' => now()->toDateTimeString(),
        ];
    }
}
