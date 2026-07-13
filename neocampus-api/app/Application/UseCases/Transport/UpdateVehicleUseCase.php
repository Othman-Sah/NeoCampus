<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\UpdateVehicleDTO;
use App\Domain\Ports\TransportPortInterface;

class UpdateVehicleUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $id, UpdateVehicleDTO $dto): array
    {
        return $this->transportRepository->updateVehicle($id, $dto->toArray());
    }
}
