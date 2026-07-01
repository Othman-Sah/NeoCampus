<?php

namespace App\Domain\Models;

class Salary
{
    public ?int $id;
    public int $enseignant_id;
    public int $etablissement_id;
    public string $mois;
    public float $salaire_de_base;
    public float $primes;
    public float $indemnites;
    public float $retenues;
    public float $salaire_net;
    public string $statut;
    public ?string $date_paiement;
    public ?string $notes;
    public ?array $enseignant; // holds joined teacher details (user name, specialty)

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->enseignant_id = $data['enseignant_id'] ?? 0;
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->mois = $data['mois'] ?? '';
        $this->salaire_de_base = (float) ($data['salaire_de_base'] ?? 0.0);
        $this->primes = (float) ($data['primes'] ?? 0.0);
        $this->indemnites = (float) ($data['indemnites'] ?? 0.0);
        $this->retenues = (float) ($data['retenues'] ?? 0.0);
        $this->salaire_net = (float) ($data['salaire_net'] ?? 0.0);
        $this->statut = $data['statut'] ?? 'Draft';
        $this->date_paiement = $data['date_paiement'] ?? null;
        $this->notes = $data['notes'] ?? null;
        $this->enseignant = $data['enseignant'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'enseignant_id' => $this->enseignant_id,
            'etablissement_id' => $this->etablissement_id,
            'mois' => $this->mois,
            'salaire_de_base' => $this->salaire_de_base,
            'primes' => $this->primes,
            'indemnites' => $this->indemnites,
            'retenues' => $this->retenues,
            'salaire_net' => $this->salaire_net,
            'statut' => $this->statut,
            'date_paiement' => $this->date_paiement,
            'notes' => $this->notes,
            'enseignant' => $this->enseignant,
        ];
    }
}
