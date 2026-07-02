import { Seance } from './Seance';

export interface Presence {
  id?: number;
  seance_id: number;
  eleve_id: number;
  statut: 'present' | 'absent' | 'retard';
  motif?: string | null;
  date: string;
  etablissement_id?: number;
  seance?: Seance;
  created_at?: string;
  updated_at?: string;
}
