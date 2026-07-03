<?php

namespace App\Application\UseCases;

use App\Domain\Ports\FinanceRecetteDepensePortInterface;
use App\Application\DTOs\CreateRecetteDepenseDTO;
use Illuminate\Support\Facades\Auth;

class ManageRecettesDepensesUseCase
{
    private FinanceRecetteDepensePortInterface $recetteDepensePort;

    public function __construct(FinanceRecetteDepensePortInterface $recetteDepensePort)
    {
        $this->recetteDepensePort = $recetteDepensePort;
    }

    public function list(array $filters = []): array
    {
        return $this->recetteDepensePort->findAll($filters);
    }

    public function find(int $id): ?array
    {
        return $this->recetteDepensePort->findById($id);
    }

    public function create(CreateRecetteDepenseDTO $dto): array
    {
        return $this->recetteDepensePort->create([
            'libelle' => $dto->libelle,
            'montant' => $dto->montant,
            'type' => $dto->type,
            'categorie' => $dto->categorie,
            'date' => $dto->date,
            'justificatif' => $dto->justificatif,
            'saisie_par' => Auth::id()
        ]);
    }

    public function update(int $id, CreateRecetteDepenseDTO $dto): array
    {
        return $this->recetteDepensePort->update($id, [
            'libelle' => $dto->libelle,
            'montant' => $dto->montant,
            'type' => $dto->type,
            'categorie' => $dto->categorie,
            'date' => $dto->date,
            'justificatif' => $dto->justificatif
        ]);
    }

    public function delete(int $id): bool
    {
        return $this->recetteDepensePort->delete($id);
    }
}
