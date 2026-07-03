import { TypeFrais } from './TypeFrais';
import { Remise } from './Remise';
import { Penalite } from './Penalite';
import { Paiement } from './Paiement';

export interface Frais {
  id: number;
  type_frais_id: number;
  eleve_id: number;
  etablissement_id: number;
  montant: number;
  date_echeance: string;
  statut: 'en_attente' | 'paye' | 'en_retard';
  annee_scolaire?: string | null;
  type_frais?: TypeFrais | null;
  eleve?: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
  } | null;
  remises?: Remise[];
  penalites?: Penalite[];
  paiements?: Paiement[];
  net_amount?: number;
  montant_restant?: number;
  created_at?: string;
  updated_at?: string;
}
