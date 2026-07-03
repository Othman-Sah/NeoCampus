import { IFinanceFeeService } from '@/domain/ports/IFinanceFeeService';
import { Frais } from '@/domain/entities/Frais';
import { Remise } from '@/domain/entities/Remise';
import { Penalite } from '@/domain/entities/Penalite';
import { axiosClient } from './axiosClient';

const FEES_STORAGE_KEY = 'neocampus_finance_fees_db';

const getLocalFees = (): Frais[] => {
  const data = localStorage.getItem(FEES_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: Frais[] = [];
  // Seed initial mock fees for students 1 to 15
  for (let sId = 1; sId <= 15; sId++) {
    // 1. Paid registration fee
    initial.push({
      id: sId * 3 - 2,
      type_frais_id: 1,
      eleve_id: sId,
      etablissement_id: 1,
      montant: 1500,
      date_echeance: '2025-09-01',
      statut: 'paye',
      annee_scolaire: '2025-2026',
      type_frais: { id: 1, libelle: 'Registration Fee', groupe_frais_id: 1, etablissement_id: 1, montant_par_defaut: 1500 },
      remises: [],
      penalites: [],
      paiements: [
        { id: sId * 2 - 1, frais_id: sId * 3 - 2, montant_paye: 1500, date_paiement: '2025-06-05', mode: 'virement', reference: `VR-${900000 + sId}`, comptable_id: 2 }
      ],
      net_amount: 1500,
      montant_restant: 0
    });

    // 2. Tuition Fee (different amounts based on grade level)
    // junior grade (classe_id 3, 5) pay 750, senior grade (classe_id 1, 2, 4) pay 1000
    const isJunior = (sId % 5 === 2 || sId % 5 === 4);
    const amount = isJunior ? 750 : 1000;
    
    // Some paid, some unpaid
    const isPaid = (sId % 3 === 0);
    const remaining = isPaid ? 0 : amount;
    const payHistory = isPaid ? [
      { id: sId * 2, frais_id: sId * 3 - 1, montant_paye: amount, date_paiement: '2025-10-10', mode: 'cash', reference: '', comptable_id: 2 }
    ] : [];

    initial.push({
      id: sId * 3 - 1,
      type_frais_id: 2,
      eleve_id: sId,
      etablissement_id: 1,
      montant: amount,
      date_echeance: '2025-10-15',
      statut: isPaid ? 'paye' : 'en_attente',
      annee_scolaire: '2025-2026',
      type_frais: { id: 2, libelle: isJunior ? 'Junior Tuition (Grade 3/5)' : 'Senior Tuition (Grade 6)', groupe_frais_id: 1, etablissement_id: 1, montant_par_defaut: amount },
      remises: [],
      penalites: [],
      paiements: payHistory,
      net_amount: amount,
      montant_restant: remaining
    });

    // 3. Lunch Regular fee (overdue for some)
    const isOverdue = (sId % 4 === 1);
    initial.push({
      id: sId * 3,
      type_frais_id: 3,
      eleve_id: sId,
      etablissement_id: 1,
      montant: 600,
      date_echeance: '2025-06-15',
      statut: isOverdue ? 'en_retard' : 'paye',
      annee_scolaire: '2025-2026',
      type_frais: { id: 3, libelle: 'Lunch Regular Fee', groupe_frais_id: 2, etablissement_id: 1, montant_par_defaut: 600 },
      remises: [],
      penalites: isOverdue ? [
        { id: sId, frais_id: sId * 3, montant: 50, motif: 'Tuition Payment Delay' }
      ] : [],
      paiements: isOverdue ? [] : [
        { id: sId * 100, frais_id: sId * 3, montant_paye: 600, date_paiement: '2025-06-10', mode: 'cash', reference: '', comptable_id: 2 }
      ],
      net_amount: isOverdue ? 650 : 600,
      montant_restant: isOverdue ? 650 : 0
    });
  }

  localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const financeFeeApiService: IFinanceFeeService = {
  async findById(id: number): Promise<Frais> {
    try {
      const response = await axiosClient.get<{ data: Frais }>(`/finance/fees/${id}`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalFees();
        const f = local.find(item => item.id === id);
        if (f) return f;
        throw new Error('Fee record not found locally');
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<Frais[]> {
    try {
      const response = await axiosClient.get<{ data: Frais[] }>(`/finance/fees`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        let list = getLocalFees();
        if (filters?.eleve_id) {
          list = list.filter(f => f.eleve_id === parseInt(filters.eleve_id));
        }
        if (filters?.statut) {
          list = list.filter(f => f.statut === filters.statut);
        }
        if (filters?.annee_scolaire) {
          list = list.filter(f => f.annee_scolaire === filters.annee_scolaire);
        }
        return list;
      }
      throw err;
    }
  },

  async assign(feeData: {
    type_frais_ids: number[];
    eleve_id?: number | null;
    classe_id?: number | null;
    date_echeance: string;
    annee_scolaire?: string | null;
    custom_amount?: number;
  }): Promise<Frais[]> {
    try {
      const response = await axiosClient.post<{ data: Frais[] }>(`/finance/fees/assign`, feeData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalFees();
        const typesStorage = localStorage.getItem('neocampus_finance_types_db');
        const types: any[] = typesStorage ? JSON.parse(typesStorage) : [];
        
        const newFees: Frais[] = [];
        const studentsToAssign: number[] = [];

        if (feeData.eleve_id) {
          studentsToAssign.push(feeData.eleve_id);
        } else if (feeData.classe_id) {
          // Mock student class lookup: fetch students from mock db
          const studentsStorage = localStorage.getItem('neocampus_students_db');
          const students = studentsStorage ? JSON.parse(studentsStorage) : [];
          const classStudents = students.filter((s: any) => s.classe_id === feeData.classe_id);
          classStudents.forEach((cs: any) => studentsToAssign.push(cs.id));
        }

        const maxId = local.reduce((max, f) => f.id > max ? f.id : max, 0);
        let currentId = maxId + 1;

        studentsToAssign.forEach(studId => {
          feeData.type_frais_ids.forEach(tfId => {
            const t = types.find(x => x.id === tfId);
            const amt = feeData.custom_amount !== undefined ? feeData.custom_amount : (t ? t.montant_par_defaut : 0);

            const nf: Frais = {
              id: currentId++,
              type_frais_id: tfId,
              eleve_id: studId,
              etablissement_id: 1,
              montant: amt,
              date_echeance: feeData.date_echeance,
              statut: 'en_attente',
              annee_scolaire: feeData.annee_scolaire || '2025-2026',
              type_frais: t || null,
              remises: [],
              penalites: [],
              paiements: [],
              net_amount: amt,
              montant_restant: amt
            };

            local.push(nf);
            newFees.push(nf);
          });
        });

        localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(local));

        // Update student balances locally
        studentsToAssign.forEach(studId => {
          const studentFees = local.filter(f => f.eleve_id === studId);
          const totalDue = studentFees.reduce((sum, f) => sum + (f.net_amount || f.montant), 0);
          const totalPaid = studentFees.reduce((sum, f) => {
            const paySum = f.paiements?.reduce((s, p) => s + p.montant_paye, 0) || 0;
            return sum + paySum;
          }, 0);

          const balancesStorage = localStorage.getItem('neocampus_finance_balances_db');
          const balances: any[] = balancesStorage ? JSON.parse(balancesStorage) : [];
          const balIdx = balances.findIndex(b => b.eleve_id === studId);
          const updatedBal = {
            id: balIdx !== -1 ? balances[balIdx].id : balances.length + 1,
            eleve_id: studId,
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
          localStorage.setItem('neocampus_finance_balances_db', JSON.stringify(balances));
        });

        return newFees;
      }
      throw err;
    }
  },

  async applyRemise(feeId: number, remiseData: { pourcentage: number; motif?: string | null }): Promise<Remise> {
    try {
      const response = await axiosClient.post<{ data: Remise }>(`/finance/fees/${feeId}/remise`, remiseData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalFees();
        const index = local.findIndex(f => f.id === feeId);
        if (index === -1) throw new Error('Fee record not found');

        const fee = local[index];
        const newRemise: Remise = {
          id: (fee.remises?.length || 0) + 1,
          frais_id: feeId,
          pourcentage: remiseData.pourcentage,
          motif: remiseData.motif || null,
          applique_par: 2,
          user: { id: 2, nom: 'Comptable', prenom: 'Test' }
        };

        if (!fee.remises) fee.remises = [];
        fee.remises.push(newRemise);

        // Recalculate net amount and remaining balance
        const remAmt = fee.montant * (remiseData.pourcentage / 100);
        const baseNet = fee.montant - remAmt;
        const penAmt = fee.penalites?.reduce((sum, p) => sum + p.montant, 0) || 0;
        fee.net_amount = baseNet + penAmt;
        
        const paidAmt = fee.paiements?.reduce((sum, p) => sum + p.montant_paye, 0) || 0;
        fee.montant_restant = Math.max(0, fee.net_amount - paidAmt);

        if (fee.montant_restant <= 0) {
          fee.statut = 'paye';
        }

        local[index] = fee;
        localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(local));

        // Trigger local balance recalculation
        this.recalculateLocalStudentSolde(fee.eleve_id);

        return newRemise;
      }
      throw err;
    }
  },

  async applyPenalite(feeId: number, penaliteData: { montant: number; motif?: string | null }): Promise<Penalite> {
    try {
      const response = await axiosClient.post<{ data: Penalite }>(`/finance/fees/${feeId}/penalite`, penaliteData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalFees();
        const index = local.findIndex(f => f.id === feeId);
        if (index === -1) throw new Error('Fee record not found');

        const fee = local[index];
        const newPenalite: Penalite = {
          id: (fee.penalites?.length || 0) + 1,
          frais_id: feeId,
          montant: penaliteData.montant,
          motif: penaliteData.motif || null,
          applique_par: 2,
          user: { id: 2, nom: 'Comptable', prenom: 'Test' }
        };

        if (!fee.penalites) fee.penalites = [];
        fee.penalites.push(newPenalite);

        // Recalculate
        const baseAmt = fee.montant;
        const remAmt = fee.remises?.reduce((sum, r) => sum + (baseAmt * (r.pourcentage / 100)), 0) || 0;
        fee.net_amount = baseAmt - remAmt + penaliteData.montant;
        
        const paidAmt = fee.paiements?.reduce((sum, p) => sum + p.montant_paye, 0) || 0;
        fee.montant_restant = Math.max(0, fee.net_amount - paidAmt);

        local[index] = fee;
        localStorage.setItem(FEES_STORAGE_KEY, JSON.stringify(local));

        // Trigger local balance recalculation
        this.recalculateLocalStudentSolde(fee.eleve_id);

        return newPenalite;
      }
      throw err;
    }
  },

  recalculateLocalStudentSolde(studentId: number) {
    const local = getLocalFees();
    const studentFees = local.filter(f => f.eleve_id === studentId);
    
    const totalDue = studentFees.reduce((sum, f) => sum + (f.net_amount || f.montant), 0);
    const totalPaid = studentFees.reduce((sum, f) => {
      const paySum = f.paiements?.reduce((s, p) => s + p.montant_paye, 0) || 0;
      return sum + paySum;
    }, 0);

    const balancesStorage = localStorage.getItem('neocampus_finance_balances_db');
    const balances: any[] = balancesStorage ? JSON.parse(balancesStorage) : [];
    const balIdx = balances.findIndex(b => b.eleve_id === studentId);
    const updatedBal = {
      id: balIdx !== -1 ? balances[balIdx].id : balances.length + 1,
      eleve_id: studentId,
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
    localStorage.setItem('neocampus_finance_balances_db', JSON.stringify(balances));
  }
};
