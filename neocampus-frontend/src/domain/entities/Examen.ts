import { Class } from './Class';

export interface Examen {
  id: number;
  date: string | null;
  intitule: string;
  classe_id: number;
  matiere_id: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  fichier_sujet: string | null;
  etablissement_id: number;
  classe?: Class;
  matiere?: { id: number; nom: string; intitule?: string };
  created_at?: string;
  updated_at?: string;
}
