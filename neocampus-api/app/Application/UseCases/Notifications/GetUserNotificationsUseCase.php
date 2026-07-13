<?php

namespace App\Application\UseCases\Notifications;

use App\Domain\Ports\NotificationPortInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetUserNotificationsUseCase
{
    private NotificationPortInterface $notificationRepository;

    public function __construct(NotificationPortInterface $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public function execute(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->notificationRepository->getUserNotifications($userId, $perPage);
    }

    public function getUnreadCount(int $userId): int
    {
        return $this->notificationRepository->getUnreadCount($userId);
    }

    public function getLatestUnread(int $userId, int $limit = 5): array
    {
        return $this->notificationRepository->getLatestUnread($userId, $limit);
    }
}
