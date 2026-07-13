<?php

namespace App\Domain\Ports;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AnnouncementPortInterface
{
    public function listAnnouncements(int $tenantId, ?string $role = null, int $perPage = 15): LengthAwarePaginator;
    public function findAnnouncement(int $id): ?array;
    public function createAnnouncement(array $data): array;
    public function updateAnnouncement(int $id, array $data): array;
    public function deleteAnnouncement(int $id): bool;
    public function togglePin(int $id): array;
}
