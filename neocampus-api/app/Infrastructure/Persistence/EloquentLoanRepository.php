<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Models\Loan;
use App\Domain\Ports\LoanRepositoryInterface;
use App\Models\Emprunt;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentLoanRepository implements LoanRepositoryInterface
{
    private function toDomain(Emprunt $emprunt): Loan
    {
        $data = $emprunt->toArray();
        
        if ($emprunt->relationLoaded('livre') && $emprunt->livre) {
            $data['livre_details'] = $emprunt->livre->toArray();
        }

        if ($emprunt->relationLoaded('adherent') && $emprunt->adherent) {
            $memberData = $emprunt->adherent->toArray();
            if ($emprunt->adherent->relationLoaded('user') && $emprunt->adherent->user) {
                $memberData['user_details'] = $emprunt->adherent->user->toArray();
            }
            $data['adherent_details'] = $memberData;
        }

        return Loan::fromArray($data);
    }

    public function paginate(int $perPage, array $filters = []): LengthAwarePaginator
    {
        $query = Emprunt::with(['livre', 'adherent.user']);

        if (!empty($filters['statut']) && $filters['statut'] !== 'all') {
            $query->where('statut', $filters['statut']);
        }

        if (!empty($filters['date_debut'])) {
            $query->where('date_emprunt', '>=', $filters['date_debut']);
        }

        if (!empty($filters['date_fin'])) {
            $query->where('date_emprunt', '<=', $filters['date_fin']);
        }

        // Search by book title or member name
        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->whereHas('livre', function ($b) use ($q) {
                    $b->where('titre', 'like', "%{$q}%")
                      ->orWhere('auteur', 'like', "%{$q}%");
                })->orWhereHas('adherent.user', function ($u) use ($q) {
                    $u->where('nom', 'like', "%{$q}%")
                      ->orWhere('prenom', 'like', "%{$q}%");
                });
            });
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($emprunt) => $this->toDomain($emprunt))
        );

        return $paginator;
    }

    public function findById(int $id): ?Loan
    {
        $emprunt = Emprunt::with(['livre', 'adherent.user'])->find($id);
        return $emprunt ? $this->toDomain($emprunt) : null;
    }

    public function create(array $data): Loan
    {
        $emprunt = Emprunt::create($data);
        // Reload relations for returning DTO
        $emprunt->load(['livre', 'adherent.user']);
        return $this->toDomain($emprunt);
    }

    public function markReturned(int $id, string $returnDate): Loan
    {
        $emprunt = Emprunt::findOrFail($id);
        $emprunt->update([
            'statut' => 'rendu',
            'date_retour_effective' => $returnDate,
        ]);
        $emprunt->load(['livre', 'adherent.user']);
        return $this->toDomain($emprunt);
    }

    public function listOverdue(int $perPage): LengthAwarePaginator
    {
        $paginator = Emprunt::with(['livre', 'adherent.user'])
            ->where('statut', 'en_retard')
            ->orderBy('date_retour_prevue', 'asc')
            ->paginate($perPage);

        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($emprunt) => $this->toDomain($emprunt))
        );

        return $paginator;
    }
}
