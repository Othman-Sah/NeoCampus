import { IFinanceAccountingService } from '@/domain/ports/IFinanceAccountingService';
import { RecetteDepense } from '@/domain/entities/RecetteDepense';
import { axiosClient } from './axiosClient';

const ACCOUNTING_STORAGE_KEY = 'neocampus_finance_accounting_db';

const getLocalAccounting = (): RecetteDepense[] => {
  const data = localStorage.getItem(ACCOUNTING_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: RecetteDepense[] = [
    {
      id: 1,
      libelle: 'Achat de fournitures scolaires de rentrée',
      montant: 4500,
      type: 'depense',
      categorie: 'Matériel',
      date: '2026-06-10',
      etablissement_id: 1,
      saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
    },
    {
      id: 2,
      libelle: 'Facture électricité du mois de Mai',
      montant: 1200,
      type: 'depense',
      categorie: 'Charges',
      date: '2026-06-12',
      etablissement_id: 1,
      saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
    },
    {
      id: 3,
      libelle: 'Vente vieux ordinateurs de la bibliothèque',
      montant: 3000,
      type: 'recette',
      categorie: 'Vente',
      date: '2026-06-15',
      etablissement_id: 1,
      saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
    },
    {
      id: 4,
      libelle: 'Recettes de la kermesse de fin d\'année',
      montant: 15000,
      type: 'recette',
      categorie: 'Événement',
      date: '2026-06-25',
      etablissement_id: 1,
      saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
    },
    {
      id: 5,
      libelle: 'Frais de maintenance du serveur académique',
      montant: 2400,
      type: 'depense',
      categorie: 'Informatique',
      date: '2026-06-28',
      etablissement_id: 1,
      saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
    }
  ];

  localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const financeAccountingApiService: IFinanceAccountingService = {
  async findById(id: number): Promise<RecetteDepense> {
    try {
      const response = await axiosClient.get<{ data: RecetteDepense }>(`/finance/accounting/${id}`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccounting();
        const entry = local.find(item => item.id === id);
        if (entry) return entry;
        throw new Error('Accounting entry not found locally');
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<RecetteDepense[]> {
    try {
      const response = await axiosClient.get<{ data: RecetteDepense[] }>(`/finance/accounting`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        let list = getLocalAccounting();
        if (filters?.type) {
          list = list.filter(e => e.type === filters.type);
        }
        if (filters?.categorie) {
          list = list.filter(e => e.categorie === filters.categorie);
        }
        return list;
      }
      throw err;
    }
  },

  async create(entryData: {
    libelle: string;
    montant: number;
    type: 'recette' | 'depense';
    categorie?: string | null;
    date: string;
    justificatif?: string | null;
  }): Promise<RecetteDepense> {
    try {
      const response = await axiosClient.post<{ data: RecetteDepense }>(`/finance/accounting`, entryData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccounting();
        const maxId = local.reduce((max, e) => e.id > max ? e.id : max, 0);
        const newEntry: RecetteDepense = {
          id: maxId + 1,
          libelle: entryData.libelle,
          montant: entryData.montant,
          type: entryData.type,
          categorie: entryData.categorie || null,
          date: entryData.date,
          justificatif: entryData.justificatif || null,
          etablissement_id: 1,
          saisie_par_user: { id: 2, nom: 'Comptable', prenom: 'Test' }
        };
        local.push(newEntry);
        localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify(local));
        return newEntry;
      }
      throw err;
    }
  },

  async update(id: number, entryData: Partial<RecetteDepense>): Promise<RecetteDepense> {
    try {
      const response = await axiosClient.put<{ data: RecetteDepense }>(`/finance/accounting/${id}`, entryData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccounting();
        const index = local.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Accounting entry not found locally');
        const updated = { ...local[index], ...entryData };
        local[index] = updated;
        localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/finance/accounting/${id}`);
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccounting();
        const filtered = local.filter(e => e.id !== id);
        localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify(filtered));
        return;
      }
      throw err;
    }
  }
};
