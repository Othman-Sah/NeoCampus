<?php

namespace App\Application\UseCases\Library;

use App\Application\DTOs\CreateBookDTO;
use App\Domain\Models\Book;
use App\Domain\Ports\BookRepositoryInterface;

class CreateBookUseCase
{
    private BookRepositoryInterface $bookRepository;

    public function __construct(BookRepositoryInterface $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function execute(CreateBookDTO $dto, int $etablissementId): Book
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $etablissementId;
        return $this->bookRepository->create($data);
    }
}
