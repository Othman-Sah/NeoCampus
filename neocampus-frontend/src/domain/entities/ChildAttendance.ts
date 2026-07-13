export interface ChildAttendance {
  date: string;
  statut: 'present' | 'absent' | 'retard';
  motif: string | null;
  justifie: boolean;
  matiere_nom: string;
  heure_debut: string;
  heure_fin: string;
}
