import { FinanceSummary } from '../entities/FinanceSummary';

export interface TransactionReportRow {
  id: number;
  date_paiement: string;
  montant_paye: number;
  mode: 'cash' | 'virement' | 'cheque';
  reference?: string | null;
  eleve_nom?: string | null;
  eleve_prenom?: string | null;
  eleve_matricule?: string | null;
  type_frais_libelle?: string | null;
  comptable_nom?: string | null;
}

export interface IFinanceReportService {
  getSummary(filters?: Record<string, string>): Promise<FinanceSummary>;
  getTransactions(filters?: Record<string, string>): Promise<TransactionReportRow[]>;
  exportTransactionsCsv(filters?: Record<string, string>): Promise<Blob>;
}
