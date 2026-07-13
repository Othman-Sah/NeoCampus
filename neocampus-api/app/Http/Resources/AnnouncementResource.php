<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) 
            ? $this->resource 
            : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        return [
            'id' => $data['id'],
            'etablissement_id' => $data['etablissement_id'],
            'user_id' => $data['user_id'],
            'titre' => $data['titre'],
            'contenu' => $data['contenu'],
            'extrait' => $data['extrait'] ?? null,
            'target_roles' => $data['target_roles'] ?? [],
            'is_pinned' => (bool)($data['is_pinned'] ?? false),
            'published_at' => $data['published_at'] ?? null,
            'created_at' => $data['created_at'] ?? null,
            'author' => isset($data['user']) ? [
                'id' => $data['user']['id'],
                'nom' => $data['user']['nom'],
                'prenom' => $data['user']['prenom'],
                'avatar' => $data['user']['avatar'] ?? null,
            ] : null,
        ];
    }
}
