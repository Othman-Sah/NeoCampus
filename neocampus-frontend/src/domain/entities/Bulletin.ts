export interface BulletinDetail {
  id: string;
  bulletin_id: string;
  matiere_id: number;
  prof_id: number;
  coefficient: number;
  moyenne_eleve: number | null;
  moyenne_min: number | null;
  moyenne_max: number | null;
  moyenne_classe_matiere: number | null;
  rang_matiere: number | null;
  appreciation_prof: string | null;
  notes_detail?: {
    examen_id: number;
    intitule: string;
    type: string;
    valeur: number | null;
    poids: number;
    absent: boolean;
  }[];
  sous_total_pondere?: number;
  matiere?: {
    id: number;
    nom: string;
    code: string;
    coefficient: number;
    groupe_matiere_id?: number | null;
    ordre_dans_groupe?: number;
    groupe_matiere?: {
      id: number;
      nom: string;
      ordre: number;
    };
  };
  prof?: {
    id: number;
    nom: string;
    prenom: string;
    user?: {
      nom: string;
      prenom: string;
    };
  };
}

export interface Bulletin {
  id: string;
  eleve_id: number;
  classe_id: number;
  annee_scolaire: string;
  periode: string;
  moyenne_generale: number | null;
  moyenne_classe: number | null;
  rang_classe: number | null;
  total_absences: number;
  absences_justifiees: number;
  absences_injustifiees: number;
  retards: number;
  appreciation_generale: string | null;
  status: 'DRAFT' | 'APPRECIATION_EN_COURS' | 'VALIDATED' | 'PUBLISHED';
  decision_conseil?: 'admis' | 'admis_conditionnel' | 'redoublement' | 'exclusion' | null;
  mention?: 'felicitations' | 'tableau_honneur' | 'encouragements' | 'avertissement_travail' | 'avertissement_conduite' | 'blame' | null;
  validated_by?: number | null;
  validated_at?: string | null;
  published_at?: string | null;
  etablissement_id: number;
  created_at: string;
  updated_at: string;
  eleve?: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    date_naissance: string;
    parent_contact?: {
      nom: string;
      relation: string;
      telephone: string;
      email: string;
    };
    user?: {
      id: number;
      nom: string;
      prenom: string;
    };
  };
  classe?: {
    id: number;
    nom: string;
    niveau: string;
  };
  details?: BulletinDetail[];
  etablissement?: {
    id: number;
    nom: string;
    adresse: string;
    logo: string | null;
    code: string;
  };
}

export interface BulletinConfig {
  id: number;
  etablissement_id: number;
  niveau: string | null;
  format_periode: 'trimestre' | 'semestre';
  seuil_encouragements: number;
  seuil_tableau_honneur: number;
  seuil_felicitations: number;
  show_min_max: boolean;
  show_rang_matiere: boolean;
  show_detail_notes: boolean;
  show_sous_total_groupe: boolean;
  note_eliminatoire?: number | null;
}

export interface GroupeMatiere {
  id: number;
  nom: string;
  ordre: number;
  etablissement_id: number;
  matieres?: {
    id: number;
    nom: string;
    code: string;
    coefficient: number;
  }[];
}

export interface TypeEvaluation {
  id: number;
  nom: string;
  code: string;
  poids_defaut: number;
  etablissement_id: number;
}

export interface CoefficientClasseMatiere {
  id: number;
  classe_id: number;
  matiere_id: number;
  coefficient: number;
  etablissement_id: number;
}
