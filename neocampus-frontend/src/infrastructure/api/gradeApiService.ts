import { axiosClient } from './axiosClient';
import { IGradeService } from '../../domain/ports/IGradeService';
import { Note } from '../../domain/entities/Note';
import { DemandeExceptionNote } from '../../domain/entities/DemandeExceptionNote';

const GRADES_STORAGE_KEY = 'neocampus_grades_db';
const EXCEPTIONS_STORAGE_KEY = 'neocampus_grade_exceptions_db';

const getLocalGrades = (): Note[] => {
  const data = localStorage.getItem(GRADES_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: Note[] = [];
  localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalGrades = (grades: Note[]) => {
  localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
};

const getLocalExceptions = (): DemandeExceptionNote[] => {
  const data = localStorage.getItem(EXCEPTIONS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: DemandeExceptionNote[] = [];
  localStorage.setItem(EXCEPTIONS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalExceptions = (exceptions: DemandeExceptionNote[]) => {
  localStorage.setItem(EXCEPTIONS_STORAGE_KEY, JSON.stringify(exceptions));
};

export const gradeApiService: IGradeService = {
  async submitBulk(examenId, grades) {
    try {
      const response = await axiosClient.post('/notes/bulk', { examen_id: examenId, notes: grades });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Saving bulk grades to local storage.');
        const local = getLocalGrades();
        
        // Remove old notes for this exam
        const filtered = local.filter(g => g.examen_id !== examenId);

        const newEntries = grades.map(g => ({
          examen_id: examenId,
          eleve_id: g.eleve_id,
          valeur: g.valeur
        }));

        const updated = [...filtered, ...newEntries];
        saveLocalGrades(updated);
        return { message: 'Offline save success', data: newEntries };
      }
      throw err;
    }
  },

  async requestException(examenId, motif) {
    try {
      const response = await axiosClient.post('/notes/exceptions/request', { examen_id: examenId, motif });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Creating grade exception request in local storage.');
        const exceptions = getLocalExceptions();
        const maxId = exceptions.reduce((max, e) => e.id > max ? e.id : max, 0);

        const newExc: DemandeExceptionNote = {
          id: maxId + 1,
          enseignant_id: 1,
          examen_id: examenId,
          motif,
          statut: 'pending',
          admin_id: null,
          etablissement_id: 1,
          enseignant: { id: 1, specialite: 'Maths', etablissement_id: 1, user: { id: 99, nom: 'Alaoui', prenom: 'Mohamed', email: 'teacher@test.com', role: 'enseignant' } },
          examen: { id: examenId, intitule: 'Contrôle 1 Algèbre', classe_id: 1, matiere_id: 1, status: 'approved', date: '2026-06-15T08:00:00', fichier_sujet: null, etablissement_id: 1, classe: { id: 1, nom: 'CM1-A', niveau: 'CM1', etablissement_id: 1 } }
        };

        exceptions.push(newExc);
        saveLocalExceptions(exceptions);
        return newExc;
      }
      throw err;
    }
  },

  async approveException(id) {
    try {
      const response = await axiosClient.post(`/admin/notes/exceptions/${id}/approve`);
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Approving grade exception in local storage.');
        const exceptions = getLocalExceptions();
        const index = exceptions.findIndex(e => e.id === id);
        if (index !== -1) {
          exceptions[index].statut = 'approved';
          exceptions[index].admin_id = 99;
          saveLocalExceptions(exceptions);
          return exceptions[index];
        }
        throw new Error('Exception not found offline');
      }
      throw err;
    }
  },

  async checkWindow(examenId) {
    try {
      const response = await axiosClient.get(`/notes/check-window/${examenId}`);
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Checking grading window status locally.');
        const exceptions = getLocalExceptions();
        const hasException = exceptions.some(e => e.examen_id === examenId && e.statut === 'approved');

        // Check window (from default settings)
        const settingsData = localStorage.getItem('neocampus_exam_settings_db');
        let withinWindow = true;
        if (settingsData) {
          const settings = JSON.parse(settingsData);
          const now = new Date();
          const start = new Date(settings.periode_saisie_notes_debut);
          const end = new Date(settings.periode_saisie_notes_fin);
          withinWindow = now >= start && now <= end;
        }

        return {
          within_window: withinWindow,
          exception_granted: hasException,
          can_enter_grades: withinWindow || hasException
        };
      }
      throw err;
    }
  },

  async getPendingExceptions() {
    try {
      const response = await axiosClient.get('/admin/notes/exceptions/pending');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalExceptions().filter(e => e.statut === 'pending');
      }
      throw err;
    }
  },

  async findByExamen(examenId) {
    try {
      const response = await axiosClient.get(`/notes/examen/${examenId}`);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalGrades();
        return local.filter(g => g.examen_id === examenId);
      }
      throw err;
    }
  }
};
