<?php

namespace App\Application\UseCases\Notifications;

use App\Domain\Ports\NotificationPortInterface;

class MarkAllNotificationsReadUseCase
{
    private NotificationPortInterface $notificationRepository;

    public function __construct(NotificationPortInterface $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public function execute(int $userId): int
    {
        return $this->notificationRepository->markAllAsRead($userId);
    }
}
