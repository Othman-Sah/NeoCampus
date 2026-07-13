<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OverviewStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_eleves' => (int) ($this['total_eleves'] ?? 0),
            'total_enseignants' => (int) ($this['total_enseignants'] ?? 0),
            'total_classes' => (int) ($this['total_classes'] ?? 0),
            'attendance_rate_today' => (float) ($this['attendance_rate_today'] ?? 100.0),
            'collection_rate_month' => (float) ($this['collection_rate_month'] ?? 100.0),
            'total_parents' => (int) ($this['total_parents'] ?? 0),
            'total_comptables' => (int) ($this['total_comptables'] ?? 0),
            'total_bibliothecaires' => (int) ($this['total_bibliothecaires'] ?? 0),
            'total_admins' => (int) ($this['total_admins'] ?? 0),
        ];
    }
}
