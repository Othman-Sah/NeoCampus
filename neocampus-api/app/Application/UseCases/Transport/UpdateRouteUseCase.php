<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\UpdateRouteDTO;
use App\Domain\Ports\TransportPortInterface;

class UpdateRouteUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $id, UpdateRouteDTO $dto): array
    {
        return $this->transportRepository->updateRoute($id, $dto->toArray());
    }
}
