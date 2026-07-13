<?php

namespace App\Application\UseCases\Transport;

use App\Domain\Ports\TransportPortInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListRoutesUseCase
{
    private TransportPortInterface $transportRepository;

    public function __construct(TransportPortInterface $transportRepository)
    {
        $this->transportRepository = $transportRepository;
    }

    public function execute(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->transportRepository->listRoutes($tenantId, $filters, $perPage);
    }
}
