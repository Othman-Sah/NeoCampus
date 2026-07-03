export interface Remise {
  id: number;
  frais_id: number;
  pourcentage: number;
  motif?: string | null;
  applique_par?: number | null;
  user?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}
