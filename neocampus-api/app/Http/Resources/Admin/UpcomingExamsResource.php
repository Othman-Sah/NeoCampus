<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UpcomingExamsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) ($this['id'] ?? 0),
            'title' => $this['title'] ?? '',
            'subject' => $this['subject'] ?? '',
            'class_name' => $this['class_name'] ?? '',
            'date' => $this['date'] ?? '',
        ];
    }
}
