export interface Salary {
  id: number;
  enseignant_id: number;
  etablissement_id: number;
  mois: string; // e.g. "2026-06"
  salaire_de_base: number;
  primes: number;
  indemnites: number;
  retenues: number;
  salaire_net: number;
  statut: 'Draft' | 'Paid';
  date_paiement?: string | null;
  notes?: string | null;
  enseignant?: {
    id: number;
    specialite: string;
    nom?: string;
    prenom?: string;
    email?: string;
  } | null;
}
