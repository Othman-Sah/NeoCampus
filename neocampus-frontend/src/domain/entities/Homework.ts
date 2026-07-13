export interface Homework {
  id: number;
  titre: string;
  description: string | null;
  date_echeance: string;
  fichier_url: string | null;
  matiere_nom: string;
  enseignant_nom: string;
  is_overdue: boolean;
  days_remaining: number;
}
