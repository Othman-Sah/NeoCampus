export interface Solde {
  id: number;
  eleve_id: number;
  etablissement_id: number;
  montant_du: number;
  montant_paye: number;
  montant_restant: number;
  updated_at: string;
  has_late_fees?: boolean;
}
