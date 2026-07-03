<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Models\Book;
use App\Domain\Ports\BookRepositoryInterface;
use App\Models\Livre;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class EloquentBookRepository implements BookRepositoryInterface
{
    private function toDomain(Livre $livre): Book
    {
        return Book::fromArray($livre->toArray());
    }

    public function paginate(int $perPage, array $filters = []): LengthAwarePaginator
    {
        $query = Livre::query();

        // 1. Search Query
        if (!empty($filters['q'])) {
            $q = $filters['q'];
            // Fallback if fulltext search matches too broad, using simple LIKE
            $query->where(function ($sub) use ($q) {
                $sub->where('titre', 'like', "%{$q}%")
                    ->orWhere('auteur', 'like', "%{$q}%")
                    ->orWhere('isbn', 'like', "%{$q}%");
            });
        }

        // 2. Genre filter
        if (!empty($filters['genre'])) {
            $query->where('genre', $filters['genre']);
        }

        // 3. Availability filter
        if (isset($filters['disponible'])) {
            $disp = filter_var($filters['disponible'], FILTER_VALIDATE_BOOLEAN);
            if ($disp) {
                $query->where('quantite_stock', '>', 0);
            }
        }

        $paginator = $query->paginate($perPage);
        
        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($livre) => $this->toDomain($livre))
        );

        return $paginator;
    }

    public function findById(int $id): ?Book
    {
        $livre = Livre::find($id);
        return $livre ? $this->toDomain($livre) : null;
    }

    public function create(array $data): Book
    {
        $livre = Livre::create($data);
        return $this->toDomain($livre);
    }

    public function update(int $id, array $data): Book
    {
        $livre = Livre::findOrFail($id);
        $livre->update($data);
        return $this->toDomain($livre);
    }

    public function delete(int $id): bool
    {
        $livre = Livre::find($id);
        if (!$livre) {
            return false;
        }
        return (bool) $livre->delete();
    }

    public function search(string $query, array $filters = []): array
    {
        $q = Livre::query()
            ->where(function ($sub) use ($query) {
                $sub->where('titre', 'like', "%{$query}%")
                    ->orWhere('auteur', 'like', "%{$query}%")
                    ->orWhere('isbn', 'like', "%{$query}%");
            });

        if (isset($filters['disponible'])) {
            $disp = filter_var($filters['disponible'], FILTER_VALIDATE_BOOLEAN);
            if ($disp) {
                $q->where('quantite_stock', '>', 0);
            }
        }

        return $q->limit(20)->get()->map(fn ($l) => $this->toDomain($l))->toArray();
    }
}
