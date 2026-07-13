export interface ChildSummary {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  classe_nom: string;
  avatar: string | null;
  relation: string | null; // "Father", "Mother", "Guardian", etc.
  latest_grade: { matiere: string; valeur: number; date: string } | null;
  absence_count_week: number;
  next_payment: { montant: number; date_echeance: string } | null;
  overall_average: number | null;
}
