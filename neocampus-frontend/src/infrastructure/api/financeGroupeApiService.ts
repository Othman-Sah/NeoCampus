import { IFinanceGroupeService } from '@/domain/ports/IFinanceGroupeService';
import { GroupeFrais } from '@/domain/entities/GroupeFrais';
import { axiosClient } from './axiosClient';

const GROUPS_STORAGE_KEY = 'neocampus_finance_groups_db';

const getLocalGroups = (): GroupeFrais[] => {
  const data = localStorage.getItem(GROUPS_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: GroupeFrais[] = [
    { id: 1, nom: 'Scolarité', description: 'Frais de scolarité annuelle et inscriptions.', etablissement_id: 1 },
    { id: 2, nom: 'Cantine', description: 'Abonnement et repas de la cantine scolaire.', etablissement_id: 1 },
    { id: 3, nom: 'Activités Parascolaires', description: 'Sorties scolaires, clubs et événements.', etablissement_id: 1 }
  ];

  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const financeGroupeApiService: IFinanceGroupeService = {
  async findById(id: number): Promise<GroupeFrais> {
    try {
      const response = await axiosClient.get<{ data: GroupeFrais }>(`/finance/groups/${id}`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalGroups();
        const g = local.find(item => item.id === id);
        if (g) return g;
        throw new Error('Fee group not found locally');
      }
      throw err;
    }
  },

  async findAll(): Promise<GroupeFrais[]> {
    try {
      const response = await axiosClient.get<{ data: GroupeFrais[] }>(`/finance/groups`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalGroups();
      }
      throw err;
    }
  },

  async create(groupData: { nom: string; description?: string | null }): Promise<GroupeFrais> {
    try {
      const response = await axiosClient.post<{ data: GroupeFrais }>(`/finance/groups`, groupData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalGroups();
        const maxId = local.reduce((max, g) => g.id > max ? g.id : max, 0);
        const newGroup: GroupeFrais = {
          id: maxId + 1,
          nom: groupData.nom,
          description: groupData.description || null,
          etablissement_id: 1
        };
        local.push(newGroup);
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(local));
        return newGroup;
      }
      throw err;
    }
  },

  async update(id: number, groupData: Partial<GroupeFrais>): Promise<GroupeFrais> {
    try {
      const response = await axiosClient.put<{ data: GroupeFrais }>(`/finance/groups/${id}`, groupData);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalGroups();
        const index = local.findIndex(g => g.id === id);
        if (index === -1) throw new Error('Fee group not found locally');
        const updated = { ...local[index], ...groupData };
        local[index] = updated;
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/finance/groups/${id}`);
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalGroups();
        const filtered = local.filter(g => g.id !== id);
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(filtered));
        return;
      }
      throw err;
    }
  }
};
