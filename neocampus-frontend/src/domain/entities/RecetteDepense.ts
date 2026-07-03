export interface RecetteDepense {
  id: number;
  libelle: string;
  montant: number;
  type: 'recette' | 'depense';
  categorie?: string | null;
  date: string;
  justificatif?: string | null;
  saisie_par?: number | null;
  etablissement_id: number;
  saisie_par_user?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}
