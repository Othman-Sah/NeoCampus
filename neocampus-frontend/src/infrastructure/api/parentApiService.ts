import { IParentService, ParentUser } from '@/domain/ports/IParentService';
import { axiosClient } from './axiosClient';

const PARENTS_STORAGE_KEY = 'neocampus_parents_db';

const getLocalParents = (): ParentUser[] => {
  const data = localStorage.getItem(PARENTS_STORAGE_KEY);
  if (data) return JSON.parse(data);

  const initial: ParentUser[] = [
    {
      id: 5,
      etablissement_id: 1,
      nom: 'Test',
      prenom: 'Parent',
      email: 'parent@neocampus.com',
      role: 'parent',
      children: [
        { id: 1, nom: 'Eleve', prenom: 'Test' }
      ]
    }
  ];

  localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const parentApiService: IParentService = {
  async findAll(): Promise<ParentUser[]> {
    try {
      const response = await axiosClient.get<{ data: ParentUser[] }>('/admin/parents');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalParents();
      }
      throw err;
    }
  },

  async create(data: any): Promise<ParentUser> {
    try {
      const response = await axiosClient.post<{ data: ParentUser }>('/admin/parents', data);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalParents();
        const maxId = local.reduce((max, u) => u.id > max ? u.id : max, 0);
        const newUser: ParentUser = {
          id: maxId + 1,
          etablissement_id: 1,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          role: 'parent',
          children: []
        };
        local.push(newUser);
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(local));
        return newUser;
      }
      throw err;
    }
  },

  async update(id: number, data: any): Promise<ParentUser> {
    try {
      const response = await axiosClient.put<{ data: ParentUser }>(`/admin/parents/${id}`, data);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalParents();
        const index = local.findIndex(u => u.id === id);
        if (index === -1) throw new Error('Parent profile not found locally');
        const updated = { ...local[index], ...data };
        local[index] = updated;
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/parents/${id}`);
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalParents();
        const filtered = local.filter(u => u.id !== id);
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(filtered));
        return;
      }
      throw err;
    }
  }
};
