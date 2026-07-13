<?php

namespace App\Application\UseCases\Transport;

use App\Domain\Ports\TransportPortInterface;

class GetDriverRouteDetailsUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $userId): ?array
    {
        return $this->transportRepository->getDriverRouteAndStudents($userId);
    }
}
