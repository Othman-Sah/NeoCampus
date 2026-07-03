import { IAccountantService } from '@/domain/ports/IAccountantService';
import { User } from '@/domain/entities/User';
import { axiosClient } from './axiosClient';

const ACCOUNTANTS_STORAGE_KEY = 'neocampus_accountants_db';

const getLocalAccountants = (): User[] => {
  const data = localStorage.getItem(ACCOUNTANTS_STORAGE_KEY);
  if (data) return JSON.parse(data);

  // Initialize with default comptables
  const initial: User[] = [
    {
      id: 2,
      etablissement_id: 1,
      nom: 'Comptable',
      prenom: 'Test',
      email: 'comptable@neocampus.com',
      role: 'comptable'
    }
  ];

  localStorage.setItem(ACCOUNTANTS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const accountantApiService: IAccountantService = {
  async findAll(): Promise<User[]> {
    try {
      const response = await axiosClient.get<{ data: User[] }>('/admin/accountants');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalAccountants();
      }
      throw err;
    }
  },

  async create(data: any): Promise<User> {
    try {
      const response = await axiosClient.post<{ data: User }>('/admin/accountants', data);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccountants();
        const maxId = local.reduce((max, u) => u.id > max ? u.id : max, 0);
        const newUser: User = {
          id: maxId + 1,
          etablissement_id: 1,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          role: 'comptable'
        };
        local.push(newUser);
        localStorage.setItem(ACCOUNTANTS_STORAGE_KEY, JSON.stringify(local));
        return newUser;
      }
      throw err;
    }
  },

  async update(id: number, data: any): Promise<User> {
    try {
      const response = await axiosClient.put<{ data: User }>(`/admin/accountants/${id}`, data);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccountants();
        const index = local.findIndex(u => u.id === id);
        if (index === -1) throw new Error('Accountant not found locally');
        const updated = { ...local[index], ...data };
        local[index] = updated;
        localStorage.setItem(ACCOUNTANTS_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/accountants/${id}`);
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalAccountants();
        const filtered = local.filter(u => u.id !== id);
        localStorage.setItem(ACCOUNTANTS_STORAGE_KEY, JSON.stringify(filtered));
        return;
      }
      throw err;
    }
  }
};
