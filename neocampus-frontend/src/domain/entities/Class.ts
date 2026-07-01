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
