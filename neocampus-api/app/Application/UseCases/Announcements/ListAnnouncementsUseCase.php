<?php

namespace App\Application\UseCases\Announcements;

use App\Domain\Ports\AnnouncementPortInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListAnnouncementsUseCase
{
    private AnnouncementPortInterface $announcementRepository;

    public function __construct(AnnouncementPortInterface $announcementRepository)
    {
        $this->announcementRepository = $announcementRepository;
    }

    public function execute(int $tenantId, ?string $role = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->announcementRepository->listAnnouncements($tenantId, $role, $perPage);
    }
}
