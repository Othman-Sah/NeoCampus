<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecentActivitiesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'action' => $this['action'] ?? '',
            'description' => $this['description'] ?? '',
            'created_at' => $this['created_at'] ?? '',
            'user_name' => $this['user_name'] ?? '',
        ];
    }
}
