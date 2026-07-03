import { GroupeFrais } from './GroupeFrais';

export interface TypeFrais {
  id: number;
  libelle: string;
  groupe_frais_id: number;
  etablissement_id: number;
  montant_par_defaut: number;
  groupe?: GroupeFrais | null;
  created_at?: string;
  updated_at?: string;
}
