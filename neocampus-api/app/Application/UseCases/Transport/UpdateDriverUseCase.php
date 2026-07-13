<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\UpdateDriverDTO;
use App\Domain\Ports\TransportPortInterface;

class UpdateDriverUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $id, UpdateDriverDTO $dto): array
    {
        return $this->transportRepository->updateDriver($id, $dto->toArray());
    }
}
