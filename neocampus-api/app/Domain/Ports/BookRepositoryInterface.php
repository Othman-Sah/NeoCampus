<?php

namespace App\Domain\Ports;

use App\Domain\Models\Book;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookRepositoryInterface
{
    public function paginate(int $perPage, array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Book;
    public function create(array $data): Book;
    public function update(int $id, array $data): Book;
    public function delete(int $id): bool;
    public function search(string $query, array $filters = []): array;
}
