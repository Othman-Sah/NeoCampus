import { IFinanceTypeService } from '@/domain/ports/IFinanceTypeService';
import { TypeFrais } from '@/domain/entities/TypeFrais';
import { axiosClient } from './axiosClient';

const TYPES_STORAGE_KEY = 'neocampus_finance_types_db';

const getLocalTypes = (): TypeFrais[] => {
  const data = localStorage.getItem(TYPES_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: TypeFrais[] = [
    { id: 1, libelle: 'Frais Inscription', groupe_frais_id: 1, etablissement_id: 1, montant_par_defaut: 1500, groupe: null },
    { id: 2, libelle: 'Mensualité Octobre', groupe_frais_id: 1, etablissement_id: 1, montant_par_defaut: 2500, groupe: null },
    { id: 3, libelle: 'Déjeuner Régulier', groupe_frais_id: 2, etablissement_id: 1, montant_par_defaut: 600, groupe: null },
    { id: 4, libelle: 'Sortie Nature', groupe_frais_id: 3, etablissement_id: 1, montant_par_defaut: 200, groupe: null }
  ];

  localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const financeTypeApiService: IFinanceTypeService = {
  async findById(id: number): Promise<TypeFrais> {
    try {
      const response = await axiosClient.get<{ data: TypeFrais }>(`/finance/types/${id}`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTypes();
        const t = local.find(item => item.id === id);
        if (t) return t;
        throw new Error('Fee type not found locally');
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<TypeFrais[]> {
    try {
      const response = await axiosClient.get<{ data: TypeFrais[] }>(`/finance/types`, { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        let list = getLocalTypes();
        if (filters?.groupe_id) {
          list = list.filter(t => t.groupe_frais_id === parseInt(filters.groupe_id));
        }
        return list;
      }
      throw err;
    }
  },

  async create(typeData: { libelle: string; groupe_frais_id: number; montant_par_defaut: number }): Promise<TypeFrais> {
    try {
      const response = await axiosClient.post<{ data: TypeFrais }>(`/finance/types`, typeData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTypes();
        const maxId = local.reduce((max, t) => t.id > max ? t.id : max, 0);
        const newType: TypeFrais = {
          id: maxId + 1,
          libelle: typeData.libelle,
          groupe_frais_id: typeData.groupe_frais_id,
          etablissement_id: 1,
          montant_par_defaut: typeData.montant_par_defaut,
          groupe: null
        };
        local.push(newType);
        localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(local));
        return newType;
      }
      throw err;
    }
  },

  async update(id: number, typeData: Partial<TypeFrais>): Promise<TypeFrais> {
    try {
      const response = await axiosClient.put<{ data: TypeFrais }>(`/finance/types/${id}`, typeData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTypes();
        const index = local.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Fee type not found locally');
        const updated = { ...local[index], ...typeData };
        local[index] = updated;
        localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/finance/types/${id}`);
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTypes();
        const filtered = local.filter(t => t.id !== id);
        localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(filtered));
        return;
      }
      throw err;
    }
  }
};
