<?php

namespace App\Application\UseCases\Transport;

use App\Domain\Ports\TransportPortInterface;

class AssignStudentsToRouteUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $routeId, array $assignments): void
    {
        $this->transportRepository->assignStudentsToRoute($routeId, $assignments);
    }
}
