<?php

namespace App\Application\UseCases\Library;

use App\Domain\Ports\BookRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListBooksUseCase
{
    private BookRepositoryInterface $bookRepository;

    public function __construct(BookRepositoryInterface $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function execute(int $perPage, array $filters = []): LengthAwarePaginator
    {
        return $this->bookRepository->paginate($perPage, $filters);
    }
}
