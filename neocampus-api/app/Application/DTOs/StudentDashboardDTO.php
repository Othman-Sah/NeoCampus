<?php

namespace App\Application\DTOs;

class StudentDashboardDTO
{
    public array $today_schedule;
    public array $recent_grades;
    public array $pending_homework;
    public int $unread_announcements_count;
    public float $attendance_rate;
    public ?float $overall_average;

    public function __construct(array $data)
    {
        $this->today_schedule = $data['today_schedule'] ?? [];
        $this->recent_grades = $data['recent_grades'] ?? [];
        $this->pending_homework = $data['pending_homework'] ?? [];
        $this->unread_announcements_count = (int)($data['unread_announcements_count'] ?? 0);
        $this->attendance_rate = (float)($data['attendance_rate'] ?? 0.0);
        $this->overall_average = isset($data['overall_average']) ? (float)$data['overall_average'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'today_schedule' => $this->today_schedule,
            'recent_grades' => $this->recent_grades,
            'pending_homework' => $this->pending_homework,
            'unread_announcements_count' => $this->unread_announcements_count,
            'attendance_rate' => $this->attendance_rate,
            'overall_average' => $this->overall_average,
        ];
    }
}
