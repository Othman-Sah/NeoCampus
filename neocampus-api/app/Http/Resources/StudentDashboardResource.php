<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();
        return [
            'today_schedule' => $data['today_schedule'] ?? [],
            'recent_grades' => $data['recent_grades'] ?? [],
            'pending_homework' => $data['pending_homework'] ?? [],
            'stats' => [
                'attendance_rate' => $data['attendance_rate'] ?? 100.0,
                'overall_average' => $data['overall_average'] ?? null,
                'unread_announcements' => $data['unread_announcements_count'] ?? 0,
            ]
        ];
    }

}
