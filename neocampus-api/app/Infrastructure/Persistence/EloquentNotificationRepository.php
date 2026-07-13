<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\NotificationPortInterface;
use App\Models\AppNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentNotificationRepository implements NotificationPortInterface
{
    public function getUserNotifications(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return AppNotification::where('target_user_id', $userId)
            ->orderBy('date_envoi', 'desc')
            ->paginate($perPage);
    }

    public function getUnreadCount(int $userId): int
    {
        return AppNotification::where('target_user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    public function getLatestUnread(int $userId, int $limit = 5): array
    {
        return AppNotification::where('target_user_id', $userId)
            ->where('is_read', false)
            ->orderBy('date_envoi', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function markAsRead(int $notificationId): bool
    {
        $notification = AppNotification::findOrFail($notificationId);
        $notification->is_read = true;
        return (bool)$notification->save();
    }

    public function markAllAsRead(int $userId): int
    {
        return AppNotification::where('target_user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    public function createNotification(array $data): array
    {
        $notification = AppNotification::create($data);
        return $notification->toArray();
    }

    public function createBulkNotifications(array $notifications): void
    {
        AppNotification::insert($notifications);
    }
}
