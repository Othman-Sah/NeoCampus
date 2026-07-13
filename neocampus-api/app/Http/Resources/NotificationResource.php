<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) 
            ? $this->resource 
            : (method_exists($this->resource, 'toArray') ? $this->resource->toArray() : (array) $this->resource);

        $dateEnvoi = Carbon::parse($data['date_envoi'] ?? $data['created_at'] ?? now());

        return [
            'id' => $data['id'],
            'etablissement_id' => $data['etablissement_id'],
            'target_user_id' => $data['target_user_id'],
            'type' => $data['type'] ?? 'systeme',
            'titre' => $data['titre'],
            'contenu' => $data['contenu'],
            'link' => $data['link'] ?? null,
            'is_read' => (bool)($data['is_read'] ?? false),
            'date_envoi' => $data['date_envoi'] ?? null,
            'relative_time' => $dateEnvoi->diffForHumans(),
            'created_at' => $data['created_at'] ?? null,
        ];
    }
}
