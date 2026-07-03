import { IFinanceReportService, TransactionReportRow } from '@/domain/ports/IFinanceReportService';
import { FinanceSummary } from '@/domain/entities/FinanceSummary';
import { axiosClient } from './axiosClient';

export const financeReportApiService: IFinanceReportService = {
  async getSummary(filters?: Record<string, string>): Promise<FinanceSummary> {
    try {
      const response = await axiosClient.get<{ data: FinanceSummary }>(`/finance/reports/summary`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        // Compute from local storage mock databases
        const feesStorage = localStorage.getItem('neocampus_finance_fees_db');
        const fees: any[] = feesStorage ? JSON.parse(feesStorage) : [];
        const paymentsStorage = localStorage.getItem('neocampus_finance_payments_db');
        const payments: any[] = paymentsStorage ? JSON.parse(paymentsStorage) : [];
        const salariesStorage = localStorage.getItem('neocampus_salaries_db');
        const salaries: any[] = salariesStorage ? JSON.parse(salariesStorage) : [];

        // Sum of payments
        const totalEncaisse = payments.reduce((sum, p) => sum + p.montant_paye, 0);

        // Sum of outstanding balances
        const outstanding = fees.reduce((sum, f) => sum + (f.montant_restant ?? f.montant), 0);

        // Count of today's payments
        const todayStr = new Date().toISOString().split('T')[0];
        const countToday = payments.filter(p => p.date_paiement === todayStr).length;

        // Sum of salaries
        const totalSalaries = salaries.reduce((sum, s) => sum + s.salaire_net, 0);

        return {
          total_encaisse: totalEncaisse,
          soldes_impayes: outstanding,
          paiements_aujourd_hui: countToday,
          masse_salariale: totalSalaries,
          period: filters?.from && filters?.to ? `${filters.from} to ${filters.to}` : 'Ce mois'
        };
      }
      throw err;
    }
  },

  async getTransactions(filters?: Record<string, string>): Promise<TransactionReportRow[]> {
    try {
      const response = await axiosClient.get<{ data: TransactionReportRow[] }>(`/finance/reports/transactions`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const paymentsStorage = localStorage.getItem('neocampus_finance_payments_db');
        const payments: any[] = paymentsStorage ? JSON.parse(paymentsStorage) : [];
        const feesStorage = localStorage.getItem('neocampus_finance_fees_db');
        const fees: any[] = feesStorage ? JSON.parse(feesStorage) : [];
        const studentsStorage = localStorage.getItem('neocampus_students_db');
        const students: any[] = studentsStorage ? JSON.parse(studentsStorage) : [];

        return payments.map(p => {
          const fee = fees.find(f => f.id === p.frais_id);
          const student = fee ? students.find((s: any) => s.id === fee.eleve_id) : null;

          return {
            id: p.id,
            date_paiement: p.date_paiement,
            montant_paye: p.montant_paye,
            mode: p.mode,
            reference: p.reference,
            eleve_nom: student?.nom || 'Hariri',
            eleve_prenom: student?.prenom || 'Amine',
            eleve_matricule: student?.matricule || 'STU039',
            type_frais_libelle: fee?.type_frais?.libelle || 'Frais Scolarité',
            comptable_nom: p.comptable ? `${p.comptable.prenom} ${p.comptable.nom}` : 'Comptable Test'
          };
        });
      }
      throw err;
    }
  },

  async exportTransactionsCsv(filters?: Record<string, string>): Promise<Blob> {
    try {
      const response = await axiosClient.get(`/finance/reports/transactions`, {
        params: { ...filters, export: 'csv' },
        responseType: 'blob'
      });
      return response.data as any;
    } catch (err: any) {
      if (!err.response) {
        // Generate mock CSV on the client side!
        const txs = await this.getTransactions(filters);
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += 'Date;Eleve;Matricule;Type de Frais;Montant (MAD);Mode de Paiement;Reference;Comptable\n';

        txs.forEach(tx => {
          csvContent += `${tx.date_paiement};${tx.eleve_prenom} ${tx.eleve_nom};${tx.eleve_matricule};${tx.type_frais_libelle};${tx.montant_paye};${tx.mode};${tx.reference || ''};${tx.comptable_nom}\n`;
        });

        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      }
      throw err;
    }
  }
};
