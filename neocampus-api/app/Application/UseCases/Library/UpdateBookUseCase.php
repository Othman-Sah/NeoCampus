<?php

namespace App\Application\UseCases\Library;

use App\Application\DTOs\UpdateBookDTO;
use App\Domain\Models\Book;
use App\Domain\Ports\BookRepositoryInterface;

class UpdateBookUseCase
{
    private BookRepositoryInterface $bookRepository;

    public function __construct(BookRepositoryInterface $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function execute(int $id, UpdateBookDTO $dto): Book
    {
        return $this->bookRepository->update($id, $dto->toArray());
    }
}
