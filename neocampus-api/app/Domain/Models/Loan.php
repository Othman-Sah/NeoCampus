<?php

namespace App\Domain\Models;

class Loan
{
    public ?int $id;
    public int $livre_id;
    public int $adherent_id;
    public string $date_emprunt;
    public string $date_retour_prevue;
    public ?string $date_retour_effective;
    public string $statut;
    public bool $amende_payee;
    public bool $amende_annulee;
    public int $etablissement_id;
    public ?string $created_at;
    public ?string $updated_at;

    // Optional relation loaded fields
    public ?array $livre_details;
    public ?array $adherent_details;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->livre_id = $data['livre_id'] ?? 0;
        $this->adherent_id = $data['adherent_id'] ?? 0;
        $this->date_emprunt = $data['date_emprunt'] ?? '';
        $this->date_retour_prevue = $data['date_retour_prevue'] ?? '';
        $this->date_retour_effective = $data['date_retour_effective'] ?? null;
        $this->statut = $data['statut'] ?? 'en_cours';
        $this->amende_payee = (bool) ($data['amende_payee'] ?? false);
        $this->amende_annulee = (bool) ($data['amende_annulee'] ?? false);
        $this->etablissement_id = $data['etablissement_id'] ?? 0;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
        $this->livre_details = $data['livre_details'] ?? null;
        $this->adherent_details = $data['adherent_details'] ?? null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'livre_id' => $this->livre_id,
            'adherent_id' => $this->adherent_id,
            'date_emprunt' => $this->date_emprunt,
            'date_retour_prevue' => $this->date_retour_prevue,
            'date_retour_effective' => $this->date_retour_effective,
            'statut' => $this->statut,
            'amende_payee' => $this->amende_payee,
            'amende_annulee' => $this->amende_annulee,
            'etablissement_id' => $this->etablissement_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'livre_details' => $this->livre_details,
            'adherent_details' => $this->adherent_details,
        ];
    }
}
