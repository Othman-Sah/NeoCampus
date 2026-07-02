import { Examen } from './Examen';
import { Teacher } from './Teacher';

export interface DemandeExceptionNote {
  id: number;
  enseignant_id: number;
  examen_id: number;
  motif: string;
  statut: 'pending' | 'approved' | 'rejected';
  admin_id?: number | null;
  etablissement_id: number;
  enseignant?: Teacher & { user?: { nom: string; prenom: string } };
  examen?: Examen;
  created_at?: string;
  updated_at?: string;
}
