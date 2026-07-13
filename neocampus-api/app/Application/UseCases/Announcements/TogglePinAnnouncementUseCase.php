<?php

namespace App\Application\UseCases\Announcements;

use App\Domain\Ports\AnnouncementPortInterface;

class TogglePinAnnouncementUseCase
{
    private AnnouncementPortInterface $announcementRepository;

    public function __construct(AnnouncementPortInterface $announcementRepository)
    {
        $this->announcementRepository = $announcementRepository;
    }

    public function execute(int $id): array
    {
        return $this->announcementRepository->togglePin($id);
    }
}
