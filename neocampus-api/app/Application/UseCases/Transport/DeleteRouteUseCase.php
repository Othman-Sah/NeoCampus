<?php

namespace App\Application\UseCases\Transport;

use App\Domain\Ports\TransportPortInterface;

class DeleteRouteUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $id): bool
    {
        return $this->transportRepository->deleteRoute($id);
    }
}
