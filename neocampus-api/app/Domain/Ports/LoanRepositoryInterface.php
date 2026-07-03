<?php

namespace App\Domain\Ports;

use App\Domain\Models\Loan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface LoanRepositoryInterface
{
    public function paginate(int $perPage, array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Loan;
    public function create(array $data): Loan;
    public function markReturned(int $id, string $returnDate): Loan;
    public function listOverdue(int $perPage): LengthAwarePaginator;
}
