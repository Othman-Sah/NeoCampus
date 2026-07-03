<?php

namespace App\Application\DTOs;

use App\Domain\Exceptions\FinanceException;

class AssignFeeDTO
{
    public array $type_frais_ids;
    public ?int $eleve_id;
    public ?int $classe_id;
    public string $date_echeance;
    public ?string $annee_scolaire;

    public function __construct(array $type_frais_ids, ?int $eleve_id, ?int $classe_id, string $date_echeance, ?string $annee_scolaire)
    {
        $this->type_frais_ids = $type_frais_ids;
        $this->eleve_id = $eleve_id;
        $this->classe_id = $classe_id;
        $this->date_echeance = $date_echeance;
        $this->annee_scolaire = $annee_scolaire;
    }

    public static function fromRequest(array $data): self
    {
        $type_frais_ids = $data['type_frais_ids'] ?? [];
        if (empty($type_frais_ids)) {
            // Also accept single type_frais_id as array if needed
            if (!empty($data['type_frais_id'])) {
                $type_frais_ids = [$data['type_frais_id']];
            } else {
                throw new FinanceException("At least one fee type (type_frais_ids) must be selected.", 422);
            }
        }

        $eleve_id = isset($data['eleve_id']) ? (int) $data['eleve_id'] : null;
        $classe_id = isset($data['classe_id']) ? (int) $data['classe_id'] : null;

        if (!$eleve_id && !$classe_id) {
            throw new FinanceException("Either eleve_id or classe_id is required.", 422);
        }

        if (empty($data['date_echeance'])) {
            throw new FinanceException("Due date (date_echeance) is required.", 422);
        }

        return new self(
            $type_frais_ids,
            $eleve_id,
            $classe_id,
            $data['date_echeance'],
            $data['annee_scolaire'] ?? null
        );
    }
}
