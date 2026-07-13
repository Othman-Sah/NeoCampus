<?php

namespace App\Application\DTOs;

class ChildSummaryDTO
{
    public int $eleve_id;
    public string $nom;
    public string $prenom;
    public string $classe_nom;
    public string $matricule;
    public ?string $avatar;
    public ?array $latest_grade;
    public int $absence_count_this_week;
    public ?array $next_payment_due;
    public ?float $overall_average;

    public function __construct(array $data)
    {
        $this->eleve_id = (int)$data['eleve_id'];
        $this->nom = $data['nom'];
        $this->prenom = $data['prenom'];
        $this->classe_nom = $data['classe_nom'];
        $this->matricule = $data['matricule'];
        $this->avatar = $data['avatar'] ?? null;
        $this->latest_grade = $data['latest_grade'] ?? null;
        $this->absence_count_this_week = (int)($data['absence_count_this_week'] ?? 0);
        $this->next_payment_due = $data['next_payment_due'] ?? null;
        $this->overall_average = isset($data['overall_average']) ? (float)$data['overall_average'] : null;
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            'eleve_id' => $this->eleve_id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'classe_nom' => $this->classe_nom,
            'matricule' => $this->matricule,
            'avatar' => $this->avatar,
            'latest_grade' => $this->latest_grade,
            'absence_count_this_week' => $this->absence_count_this_week,
            'next_payment_due' => $this->next_payment_due,
            'overall_average' => $this->overall_average,
        ];
    }
}
