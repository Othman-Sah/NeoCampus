<?php

namespace App\Application\UseCases\Transport;

use App\Application\DTOs\CreateDriverDTO;
use App\Domain\Ports\TransportPortInterface;

class CreateDriverUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(CreateDriverDTO $dto, int $tenantId): array
    {
        $data = $dto->toArray();
        $data['etablissement_id'] = $tenantId;
        return $this->transportRepository->createDriver($data);
    }
}
