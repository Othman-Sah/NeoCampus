<?php

namespace App\Application\UseCases\Announcements;

use App\Application\DTOs\CreateAnnouncementDTO;
use App\Domain\Ports\AnnouncementPortInterface;

class CreateAnnouncementUseCase
{
    private AnnouncementPortInterface $announcementRepository;

    public function __construct(AnnouncementPortInterface $announcementRepository)
    {
        $this->announcementRepository = $announcementRepository;
    }

    public function execute(CreateAnnouncementDTO $dto, int $tenantId, int $userId): array
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $tenantId;
        $data['user_id'] = $userId;
        return $this->announcementRepository->createAnnouncement($data);
    }
}
