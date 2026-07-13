<?php

namespace App\Domain\Ports;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NotificationPortInterface
{
    public function getUserNotifications(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function getUnreadCount(int $userId): int;
    public function getLatestUnread(int $userId, int $limit = 5): array;
    public function markAsRead(int $notificationId): bool;
    public function markAllAsRead(int $userId): int;
    public function createNotification(array $data): array;
    public function createBulkNotifications(array $notifications): void;
}
