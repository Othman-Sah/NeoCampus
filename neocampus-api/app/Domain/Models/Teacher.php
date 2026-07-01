<?php

namespace App\Domain\Models;

use App\Models\Enseignant;

/**
 * Teacher Data Transfer Object.
 *
 * Immutable representation of a teacher profile including their
 * user credentials and class assignments. Built from the Eloquent
 * model via fromModel() — the single source of truth for
 * transforming database models into domain objects.
 */
final readonly class Teacher
{
    /**
     * @param TeacherClassAssignment[] $classes
     */
    public function __construct(
        public int     $id,
        public ?int    $user_id,
        public string  $specialite,
        public float   $salaire_de_base,
        public int     $etablissement_id,
        public ?TeacherUser $user = null,
        public array   $classes = [],
    ) {}

    /**
     * Build a Teacher DTO directly from an Eloquent Enseignant model.
     * Expects the model to have eager-loaded: user, chargeHoraires.classe, chargeHoraires.matiere
     */
    public static function fromModel(Enseignant $model): self
    {
        $user = $model->user
            ? new TeacherUser(
                id: $model->user->id,
                etablissement_id: $model->user->etablissement_id,
                nom: $model->user->nom,
                prenom: $model->user->prenom,
                email: $model->user->email,
                role: $model->user->role,
                avatar: $model->user->avatar,
            )
            : null;

        $classes = $model->chargeHoraires->map(
            fn($ch) => new TeacherClassAssignment(
                classe_id: $ch->classe_id,
                classe_nom: $ch->classe->nom ?? null,
                niveau: $ch->classe->niveau ?? null,
                matiere_id: $ch->matiere_id,
                matiere_nom: $ch->matiere->nom ?? null,
            )
        )->all();

        return new self(
            id: $model->id,
            user_id: $model->user_id,
            specialite: $model->specialite,
            salaire_de_base: (float) $model->salaire_de_base,
            etablissement_id: $model->etablissement_id,
            user: $user,
            classes: $classes,
        );
    }

    /**
     * Serialize to an array matching the expected API JSON shape.
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'specialite' => $this->specialite,
            'salaire_de_base' => $this->salaire_de_base,
            'etablissement_id' => $this->etablissement_id,
            'user' => $this->user?->toArray(),
            'classes' => array_map(fn(TeacherClassAssignment $c) => $c->toArray(), $this->classes),
        ];
    }
}
