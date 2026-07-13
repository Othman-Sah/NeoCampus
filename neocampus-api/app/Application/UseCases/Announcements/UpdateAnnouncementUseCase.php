<?php

namespace App\Application\UseCases\Announcements;

use App\Application\DTOs\UpdateAnnouncementDTO;
use App\Domain\Ports\AnnouncementPortInterface;

class UpdateAnnouncementUseCase
{
    private AnnouncementPortInterface $announcementRepository;

    public function __construct(AnnouncementPortInterface $announcementRepository)
    {
        $this->announcementRepository = $announcementRepository;
    }

    public function execute(int $id, UpdateAnnouncementDTO $dto): array
    {
        return $this->announcementRepository->updateAnnouncement($id, $dto->toArray());
    }
}
