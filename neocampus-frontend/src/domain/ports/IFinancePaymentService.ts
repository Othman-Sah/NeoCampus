import { Paiement } from '../entities/Paiement';
import { Frais } from '../entities/Frais';
import { Solde } from '../entities/Solde';

export interface StudentBalanceResponse {
  student: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    classe_id?: number | null;
  };
  fees: Frais[];
  solde: Solde;
}

export interface IFinancePaymentService {
  recordPayment(paymentData: {
    frais_id: number;
    montant_paye: number;
    date_paiement: string;
    mode: 'cash' | 'virement' | 'cheque';
    reference?: string | null;
  }): Promise<Paiement>;
  findAll(filters?: Record<string, string>): Promise<Paiement[]>;
  getStudentBalance(studentId: number): Promise<StudentBalanceResponse>;
}
