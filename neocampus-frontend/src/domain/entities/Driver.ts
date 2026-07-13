import { Vehicle } from './Vehicle';

export interface Driver {
  id: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  num_permis: string;
  vehicule_id: number | null;
  vehicule?: Vehicle;
  user_id?: number;
  user?: { email: string } | null;
  statut: 'actif' | 'inactif';
  created_at: string;
}
