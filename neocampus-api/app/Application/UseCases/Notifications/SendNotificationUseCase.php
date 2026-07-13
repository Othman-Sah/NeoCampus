<?php

namespace App\Application\UseCases\Notifications;

use App\Application\DTOs\CreateNotificationDTO;
use App\Domain\Ports\NotificationPortInterface;

class SendNotificationUseCase
{
    private NotificationPortInterface $notificationRepository;

    public function __construct(NotificationPortInterface $notificationRepository)
    {
        $this->notificationRepository = $notificationRepository;
    }

    public function execute(CreateNotificationDTO $dto, int $tenantId): array
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $tenantId;
        return $this->notificationRepository->createNotification($data);
    }
}
