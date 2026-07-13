<?php

namespace App\Domain\Models;

class AppNotification
{
    public ?int $id;
    public int $etablissement_id;
    public int $target_user_id;
    public string $type;
    public string $titre;
    public string $contenu;
    public ?string $link;
    public bool $is_read;
    public ?string $date_envoi;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->target_user_id = $data['target_user_id'] ?? 0;
        $this->type = $data['type'] ?? 'systeme';
        $this->titre = $data['titre'] ?? '';
        $this->contenu = $data['contenu'] ?? '';
        $this->link = $data['link'] ?? null;
        $this->is_read = (bool)($data['is_read'] ?? false);
        $this->date_envoi = $data['date_envoi'] ?? null;
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
            'target_user_id' => $this->target_user_id,
            'type' => $this->type,
            'titre' => $this->titre,
            'contenu' => $this->contenu,
            'link' => $this->link,
            'is_read' => $this->is_read,
            'date_envoi' => $this->date_envoi,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
