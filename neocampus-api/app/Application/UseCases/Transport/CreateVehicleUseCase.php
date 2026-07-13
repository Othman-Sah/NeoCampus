<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\CreateVehicleDTO;
use App\Domain\Ports\TransportPortInterface;

class CreateVehicleUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(CreateVehicleDTO $dto, int $tenantId): array
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $tenantId;
        return $this->transportRepository->createVehicle($data);
    }
}
