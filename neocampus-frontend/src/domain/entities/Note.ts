export interface Note {
  id?: number;
  valeur: number;
  examen_id: number;
  eleve_id: number;
  etablissement_id?: number;
  created_at?: string;
  updated_at?: string;
}
