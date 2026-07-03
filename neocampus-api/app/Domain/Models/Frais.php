<?php

namespace App\Domain\Models;

class Frais
{
    public ?int $id;
    public int $type_frais_id;
    public int $eleve_id;
    public int $etablissement_id;
    public float $montant;
    public string $date_echeance;
    public string $statut;
    public ?string $annee_scolaire;
    public ?array $type_frais;
    public ?array $eleve;
    public array $remises;
    public array $penalites;
    public array $paiements;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->type_frais_id = $data['type_frais_id'] ?? 0;
        $this->eleve_id = $data['eleve_id'] ?? 0;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->montant = (float) ($data['montant'] ?? 0.0);
        $this->date_echeance = $data['date_echeance'] ?? '';
        $this->statut = $data['statut'] ?? 'en_attente';
        $this->annee_scolaire = $data['annee_scolaire'] ?? null;
        $this->type_frais = $data['type_frais'] ?? null;
        $this->eleve = $data['eleve'] ?? null;
        $this->remises = $data['remises'] ?? [];
        $this->penalites = $data['penalites'] ?? [];
        $this->paiements = $data['paiements'] ?? [];
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type_frais_id' => $this->type_frais_id,
            'eleve_id' => $this->eleve_id,
            'etablissement_id' => $this->etablissement_id,
            'montant' => $this->montant,
            'date_echeance' => $this->date_echeance,
            'statut' => $this->statut,
            'annee_scolaire' => $this->annee_scolaire,
            'type_frais' => $this->type_frais,
            'eleve' => $this->eleve,
            'remises' => $this->remises,
            'penalites' => $this->penalites,
            'paiements' => $this->paiements,
        ];
    }
}
