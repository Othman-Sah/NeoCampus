<?php

namespace App\Application\UseCases\Library;

use App\Domain\Ports\BookRepositoryInterface;

class DeleteBookUseCase
{
    private BookRepositoryInterface $bookRepository;

    public function __construct(BookRepositoryInterface $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function execute(int $id): bool
    {
        return $this->bookRepository->delete($id);
    }
}
