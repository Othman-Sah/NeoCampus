<?php

namespace App\Application\UseCases\Notifications;

use App\Domain\Ports\NotificationPortInterface;

class MarkNotificationReadUseCase
{
    private NotificationPortInterface $notificationRepository;

    public function __construct(NotificationPortInterface $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public function execute(int $notificationId): bool
    {
        return $this->notificationRepository->markAsRead($notificationId);
    }
}
