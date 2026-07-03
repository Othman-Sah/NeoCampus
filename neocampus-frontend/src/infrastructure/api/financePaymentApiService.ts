import { IFinancePaymentService, StudentBalanceResponse } from '@/domain/ports/IFinancePaymentService';
import { Paiement } from '@/domain/entities/Paiement';
import { axiosClient } from './axiosClient';

const PAYMENTS_STORAGE_KEY = 'neocampus_finance_payments_db';
const BALANCES_STORAGE_KEY = 'neocampus_finance_balances_db';

const getLocalPayments = (): Paiement[] => {
  const data = localStorage.getItem(PAYMENTS_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: Paiement[] = [
    {
      id: 1,
      frais_id: 1,
      montant_paye: 1500,
      date_paiement: '2026-06-05',
      mode: 'virement',
      reference: 'VR-192837',
      comptable_id: 2,
      comptable: { id: 2, nom: 'Comptable', prenom: 'Test' }
    }
  ];

  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const financePaymentApiService: IFinancePaymentService = {
  async recordPayment(paymentData: {
    frais_id: number;
    montant_paye: number;
    date_paiement: string;
    mode: 'cash' | 'virement' | 'cheque';
    reference?: string | null;
  }): Promise<Paiement> {
    try {
      const response = await axiosClient.post<{ data: Paiement }>(`/finance/payments`, paymentData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const localPayments = getLocalPayments();
        const feesStorage = localStorage.getItem('neocampus_finance_fees_db');
        const fees: any[] = feesStorage ? JSON.parse(feesStorage) : [];
        const feeIndex = fees.findIndex(f => f.id === paymentData.frais_id);
        if (feeIndex === -1) throw new Error('Fee record not found');

        const fee = fees[feeIndex];
        const maxId = localPayments.reduce((max, p) => p.id > max ? p.id : max, 0);

        const newPayment: Paiement = {
          id: maxId + 1,
          frais_id: paymentData.frais_id,
          montant_paye: paymentData.montant_paye,
          date_paiement: paymentData.date_paiement,
          mode: paymentData.mode,
          reference: paymentData.reference || null,
          comptable_id: 2,
          comptable: { id: 2, nom: 'Comptable', prenom: 'Test' }
        };

        localPayments.push(newPayment);
        localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(localPayments));

        // Update fee payments and status
        if (!fee.paiements) fee.paiements = [];
        fee.paiements.push(newPayment);

        const net = fee.net_amount || fee.montant;
        const paid = fee.paiements.reduce((sum: number, p: any) => sum + p.montant_paye, 0);
        fee.montant_restant = Math.max(0, net - paid);

        if (fee.montant_restant <= 0) {
          fee.statut = 'paye';
        }

        fees[feeIndex] = fee;
        localStorage.setItem('neocampus_finance_fees_db', JSON.stringify(fees));

        // Update student balance
        const studentFees = fees.filter(f => f.eleve_id === fee.eleve_id);
        const totalDue = studentFees.reduce((sum, f) => sum + (f.net_amount || f.montant), 0);
        const totalPaid = studentFees.reduce((sum, f) => {
          const paySum = f.paiements?.reduce((s: number, p: any) => s + p.montant_paye, 0) || 0;
          return sum + paySum;
        }, 0);

        const balancesData = localStorage.getItem(BALANCES_STORAGE_KEY);
        const balances: any[] = balancesData ? JSON.parse(balancesData) : [];
        const balIdx = balances.findIndex(b => b.eleve_id === fee.eleve_id);
        const updatedBal = {
          id: balIdx !== -1 ? balances[balIdx].id : balances.length + 1,
          eleve_id: fee.eleve_id,
          etablissement_id: 1,
          montant_du: totalDue,
          montant_paye: totalPaid,
          montant_restant: totalDue - totalPaid,
          updated_at: new Date().toISOString()
        };

        if (balIdx !== -1) {
          balances[balIdx] = updatedBal;
        } else {
          balances.push(updatedBal);
        }
        localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(balances));

        return newPayment;
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<Paiement[]> {
    try {
      const response = await axiosClient.get<{ data: Paiement[] }>(`/finance/payments`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        let list = getLocalPayments();
        if (filters?.mode) {
          list = list.filter(p => p.mode === filters.mode);
        }
        return list;
      }
      throw err;
    }
  },

  async getStudentBalance(studentId: number): Promise<StudentBalanceResponse> {
    try {
      const response = await axiosClient.get<{ data: StudentBalanceResponse }>(`/finance/students/${studentId}/balance`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        // Fetch student details from mock database
        const studentsStorage = localStorage.getItem('neocampus_students_db');
        const students = studentsStorage ? JSON.parse(studentsStorage) : [];
        let student = students.find((s: any) => s.id === studentId);

        if (!student) {
          // Default mock student if not found
          student = { id: studentId, nom: 'Hariri', prenom: 'Amine', matricule: 'STU039', classe_id: 1 };
        }

        // Fetch student fees
        const feesStorage = localStorage.getItem('neocampus_finance_fees_db');
        let fees: any[] = feesStorage ? JSON.parse(feesStorage) : [];
        fees = fees.filter(f => f.eleve_id === studentId);

        // Fetch or create student solde
        const balancesData = localStorage.getItem(BALANCES_STORAGE_KEY);
        const balances: any[] = balancesData ? JSON.parse(balancesData) : [];
        let solde = balances.find(b => b.eleve_id === studentId);

        if (!solde) {
          const totalDue = fees.reduce((sum, f) => sum + (f.net_amount || f.montant), 0);
          const totalPaid = fees.reduce((sum, f) => {
            const paySum = f.paiements?.reduce((s: number, p: any) => s + p.montant_paye, 0) || 0;
            return sum + paySum;
          }, 0);

          solde = {
            id: balances.length + 1,
            eleve_id: studentId,
            etablissement_id: 1,
            montant_du: totalDue,
            montant_paye: totalPaid,
            montant_restant: totalDue - totalPaid,
            updated_at: new Date().toISOString()
          };
          balances.push(solde);
          localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(balances));
        }

        return {
          student,
          fees,
          solde
        };
      }
      throw err;
    }
  }
};
