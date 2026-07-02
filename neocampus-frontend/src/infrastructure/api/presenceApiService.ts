import { axiosClient } from './axiosClient';
import { IPresenceService } from '../../domain/ports/IPresenceService';
import { Presence } from '../../domain/entities/Presence';

const PRESENCES_STORAGE_KEY = 'neocampus_presences_db';

const getLocalPresences = (): Presence[] => {
  const data = localStorage.getItem(PRESENCES_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: Presence[] = [];
  localStorage.setItem(PRESENCES_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalPresences = (presences: Presence[]) => {
  localStorage.setItem(PRESENCES_STORAGE_KEY, JSON.stringify(presences));
};

export const presenceApiService: IPresenceService = {
  async submitBulk(seanceId, date, presences) {
    try {
      const response = await axiosClient.post('/presences/bulk', { seance_id: seanceId, date, presences });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Saving bulk presences to local storage.');
        const local = getLocalPresences();
        // Remove old entries for this seance & date
        const filtered = local.filter(p => !(p.seance_id === seanceId && p.date === date));
        
        let maxId = local.reduce((max, item) => (item.id ?? 0) > max ? (item.id ?? 0) : max, 0);
        const newEntries = presences.map(p => ({
          id: ++maxId,
          seance_id: seanceId,
          date,
          eleve_id: p.eleve_id,
          statut: p.statut as any,
          motif: p.motif ?? null,
        }));
        
        const updated = [...filtered, ...newEntries];
        saveLocalPresences(updated);
        return { message: 'Offline save success', data: newEntries };
      }
      throw err;
    }
  },

  async getClassPresences(classeId, date) {
    try {
      const response = await axiosClient.get(`/classes/${classeId}/presences`, { params: { date } });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching class presences from local storage.');
        const local = getLocalPresences();
        // Just return all presences matching date
        return local.filter(p => p.date === date);
      }
      throw err;
    }
  },

  async getStudentPresences(eleveId) {
    try {
      const response = await axiosClient.get(`/eleves/${eleveId}/presences`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching student presences from local storage.');
        const local = getLocalPresences();
        return local.filter(p => p.eleve_id === eleveId);
      }
      throw err;
    }
  },

  async getAllPresences(filters) {
    try {
      const response = await axiosClient.get<{ data: Presence[] }>('/presences', { params: filters });
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching filtered presences from local storage.');
        let local = getLocalPresences();
        
        // Filter out present records - only return absent/retard for admin view
        local = local.filter(p => p.statut === 'absent' || p.statut === 'retard');

        if (filters.range) {
          const today = new Date().toISOString().split('T')[0];
          const todayMs = new Date(today).getTime();

          local = local.filter(p => {
            const pMs = new Date(p.date).getTime();
            const diffDays = (todayMs - pMs) / (1000 * 60 * 60 * 24);

            if (filters.range === 'day') {
              return p.date === today;
            } else if (filters.range === 'month') {
              return diffDays <= 30;
            } else if (filters.range === '3_months') {
              return diffDays <= 90;
            } else if (filters.range === 'year') {
              return diffDays <= 365;
            }
            return true;
          });
        }

        if (filters.search) {
          const q = filters.search.toLowerCase();
          const studentsData = localStorage.getItem('neocampus_students_db');
          const students: any[] = studentsData ? JSON.parse(studentsData) : [];
          
          local = local.filter(p => {
            const student = students.find(s => s.id === p.eleve_id);
            if (!student) return false;
            return (
              student.nom.toLowerCase().includes(q) ||
              student.prenom.toLowerCase().includes(q) ||
              student.matricule.toLowerCase().includes(q)
            );
          });
        }

        // Attach student details from local storage for offline rendering
        const studentsData = localStorage.getItem('neocampus_students_db');
        const students: any[] = studentsData ? JSON.parse(studentsData) : [];
        
        // Attach seances / timetables details
        const seancesData = localStorage.getItem('neocampus_seances_db');
        const seances: any[] = seancesData ? JSON.parse(seancesData) : [];

        local = local.map(p => {
          const student = students.find(s => s.id === p.eleve_id);
          const seance = seances.find(s => s.id === p.seance_id);
          return {
            ...p,
            eleve: student ? {
              ...student,
              classe: { nom: student.classe_nom }
            } : undefined,
            seance: seance ? {
              ...seance,
              matiere: { nom: seance.matiere_nom }
            } : undefined
          };
        });

        return local;
      }
      throw err;
    }
  },

  async updatePresenceStatus(id, statut, motif) {
    try {
      const response = await axiosClient.put(`/presences/${id}`, { statut, motif });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Updating presence status in local storage.');
        const local = getLocalPresences();
        const index = local.findIndex(p => p.id === id);
        if (index !== -1) {
          local[index].statut = statut as any;
          local[index].motif = motif ?? null;
          saveLocalPresences(local);
          return { message: 'Offline status update success', data: local[index] };
        }
        throw new Error('Presence record not found locally');
      }
      throw err;
    }
  },
};
