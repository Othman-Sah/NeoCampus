export interface Class {
  id: number;
  nom: string;
  niveau?: string | null;
  section_id: number;
  annee_scolaire_id: number;
  etablissement_id: number;
  students_count?: number;
  teachers_count?: number;
}

export interface ClassMatiereAssignment {
  matiere_id: number;
  nom: string;
  code: string;
  coefficient_global: number;
  coefficient_classe: number | null;
  enseignant: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
}
