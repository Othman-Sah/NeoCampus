import { Examen } from './Examen';
import { Teacher } from './Teacher';

export interface DemandePlannificationExamen {
  id: number;
  enseignant_id: number;
  examen_id: number;
  date_proposee: string;
  statut: 'pending' | 'approved' | 'rejected';
  commentaire_admin?: string | null;
  etablissement_id: number;
  enseignant?: Teacher & { user?: { nom: string; prenom: string } };
  examen?: Examen;
  created_at?: string;
  updated_at?: string;
}
