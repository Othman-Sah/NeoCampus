<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceTypeFraisPortInterface;
use App\Application\DTOs\CreateTypeFraisDTO;

class ManageTypeFraisUseCase
{
    private FinanceTypeFraisPortInterface $typePort;

    public function __construct(FinanceTypeFraisPortInterface $typePort)
    {
        $this->typePort = $typePort;
    }

    public function list(array $filters = []): array
    {
        return $this->typePort->findAll($filters);
    }

    public function find(int $id): ?array
    {
        return $this->typePort->findById($id);
    }

    public function create(CreateTypeFraisDTO $dto): array
    {
        return $this->typePort->create([
            'libelle' => $dto->libelle,
            'groupe_frais_id' => $dto->groupe_frais_id,
            'montant_par_defaut' => $dto->montant_par_defaut
        ]);
    }

    public function update(int $id, CreateTypeFraisDTO $dto): array
    {
        return $this->typePort->update($id, [
            'libelle' => $dto->libelle,
            'groupe_frais_id' => $dto->groupe_frais_id,
            'montant_par_defaut' => $dto->montant_par_defaut
        ]);
    }

    public function delete(int $id): bool
    {
        return $this->typePort->delete($id);
    }
}
