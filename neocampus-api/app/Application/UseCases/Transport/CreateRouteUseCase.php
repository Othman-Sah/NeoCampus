<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\CreateRouteDTO;
use App\Domain\Ports\TransportPortInterface;

class CreateRouteUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(CreateRouteDTO $dto, int $tenantId): array
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $tenantId;
        return $this->transportRepository->createRoute($data);
    }
}
