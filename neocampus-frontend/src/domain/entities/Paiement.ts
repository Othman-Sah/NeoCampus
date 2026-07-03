export interface Paiement {
  id: number;
  frais_id: number;
  montant_paye: number;
  date_paiement: string;
  mode: 'cash' | 'virement' | 'cheque';
  reference?: string | null;
  comptable_id?: number | null;
  comptable?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}
