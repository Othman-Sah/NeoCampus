export interface GroupeFrais {
  id: number;
  nom: string;
  description?: string | null;
  etablissement_id: number;
  created_at?: string;
  updated_at?: string;
}
