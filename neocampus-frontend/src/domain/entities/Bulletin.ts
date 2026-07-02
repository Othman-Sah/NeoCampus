export interface Bulletin {
  id?: number;
  eleve_id: number;
  periode: string;
  moyenne_generale: number;
  date_generation: string;
  etablissement_id?: number;
  created_at?: string;
  updated_at?: string;
}
