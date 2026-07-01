export interface Seance {
  id: number;
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  heure_debut: string; // 'HH:MM'
  heure_fin: string; // 'HH:MM'
  classe_id: number;
  classe_nom?: string;
  enseignant_id: number;
  enseignant_nom?: string;
  matiere_id: number;
  matiere_nom?: string;
  matiere_intitule?: string;
  etablissement_id: number;
}
