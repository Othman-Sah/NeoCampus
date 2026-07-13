<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceTrendResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'date' => $this['date'] ?? '',
            'attendance_rate' => (float) ($this['attendance_rate'] ?? 0.0),
        ];
    }
}
