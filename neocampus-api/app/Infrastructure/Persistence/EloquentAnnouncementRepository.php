<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\AnnouncementPortInterface;
use App\Models\Annonce;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAnnouncementRepository implements AnnouncementPortInterface
{
    public function listAnnouncements(int $tenantId, ?string $role = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Annonce::where('etablissement_id', $tenantId)
            ->with('user')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc');

        if ($role !== null && $role !== 'admin') {
            $query->where(function ($q) use ($role) {
                $q->whereJsonContains('target_roles', $role)
                  ->orWhereJsonContains('target_roles', '*'); // support global announcements
            });
        }

        return $query->paginate($perPage);
    }

    public function findAnnouncement(int $id): ?array
    {
        $annonce = Annonce::with('user')->find($id);
        return $annonce ? $annonce->toArray() : null;
    }

    public function createAnnouncement(array $data): array
    {
        $annonce = Annonce::create($data);
        return $annonce->load('user')->toArray();
    }

    public function updateAnnouncement(int $id, array $data): array
    {
        $annonce = Annonce::findOrFail($id);
        $annonce->update($data);
        return $annonce->load('user')->toArray();
    }

    public function deleteAnnouncement(int $id): bool
    {
        $annonce = Annonce::findOrFail($id);
        return (bool)$annonce->delete();
    }

    public function togglePin(int $id): array
    {
        $annonce = Annonce::findOrFail($id);
        $annonce->is_pinned = !$annonce->is_pinned;
        $annonce->save();
        return $annonce->load('user')->toArray();
    }
}
