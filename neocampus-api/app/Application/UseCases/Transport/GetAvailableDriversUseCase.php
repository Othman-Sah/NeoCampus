<?php

namespace App\Application\UseCases\Transport;

use App\Domain\Ports\TransportPortInterface;

class GetAvailableDriversUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $tenantId): array
    {
        return $this->transportRepository->getAvailableDrivers($tenantId);
    }
}
