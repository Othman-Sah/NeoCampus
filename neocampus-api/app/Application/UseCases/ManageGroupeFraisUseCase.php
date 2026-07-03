<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceGroupeFraisPortInterface;
use App\Application\DTOs\CreateGroupeFraisDTO;

class ManageGroupeFraisUseCase
{
    private FinanceGroupeFraisPortInterface $groupePort;

    public function __construct(FinanceGroupeFraisPortInterface $groupePort)
    {
        $this->groupePort = $groupePort;
    }

    public function list(): array
    {
        return $this->groupePort->findAll();
    }

    public function find(int $id): ?array
    {
        return $this->groupePort->findById($id);
    }

    public function create(CreateGroupeFraisDTO $dto): array
    {
        return $this->groupePort->create([
            'nom' => $dto->nom,
            'description' => $dto->description
        ]);
    }

    public function update(int $id, CreateGroupeFraisDTO $dto): array
    {
        return $this->groupePort->update($id, [
            'nom' => $dto->nom,
            'description' => $dto->description
        ]);
    }

    public function delete(int $id): bool
    {
        return $this->groupePort->delete($id);
    }
}
