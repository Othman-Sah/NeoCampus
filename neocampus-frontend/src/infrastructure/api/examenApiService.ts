import { axiosClient } from './axiosClient';
import { IExamenService } from '../../domain/ports/IExamenService';
import { Examen } from '../../domain/entities/Examen';
import { ParametresExamen } from '../../domain/entities/ParametresExamen';
import { DemandePlannificationExamen } from '../../domain/entities/DemandePlannificationExamen';

const EXAMS_STORAGE_KEY = 'neocampus_exams_db';
const SETTINGS_STORAGE_KEY = 'neocampus_exam_settings_db';
const PROPOSALS_STORAGE_KEY = 'neocampus_exam_proposals_db';

const getLocalExams = (): Examen[] => {
  const data = localStorage.getItem(EXAMS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: Examen[] = [
    { id: 1, intitule: 'Contrôle 1 Algèbre', classe_id: 1, matiere_id: 1, status: 'approved', date: '2026-06-15T08:00:00', fichier_sujet: null, etablissement_id: 1, classe: { id: 1, nom: 'CM1-A', niveau: 'CM1', etablissement_id: 1 } },
    { id: 2, intitule: 'Contrôle 2 Analyse', classe_id: 1, matiere_id: 1, status: 'approved', date: '2026-06-20T10:00:00', fichier_sujet: 'subjects/sujet_analyse.pdf', etablissement_id: 1, classe: { id: 1, nom: 'CM1-A', niveau: 'CM1', etablissement_id: 1 } },
    { id: 3, intitule: 'Examen Blanc Physique', classe_id: 2, matiere_id: 2, status: 'approved', date: '2026-06-25T14:00:00', fichier_sujet: null, etablissement_id: 1, classe: { id: 2, nom: 'CM2-B', niveau: 'CM2', etablissement_id: 1 } },
  ];
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalExams = (exams: Examen[]) => {
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
};

const getLocalSettings = (): ParametresExamen => {
  const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: ParametresExamen = {
    periode_saisie_notes_debut: '2026-06-01T00:00:00',
    periode_saisie_notes_fin: '2026-07-30T23:59:59',
    force_admin_schedule: false,
    require_sujet_upload: true,
    template_sujet_path: 'templates/exam_template_emsi.docx',
    etablissement_id: 1
  };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalSettings = (settings: ParametresExamen) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

const getLocalProposals = (): DemandePlannificationExamen[] => {
  const data = localStorage.getItem(PROPOSALS_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial: DemandePlannificationExamen[] = [];
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveLocalProposals = (props: DemandePlannificationExamen[]) => {
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(props));
};

export const examenApiService: IExamenService = {
  async proposeSchedule(data) {
    try {
      const response = await axiosClient.post('/examens/propose-schedule', data);
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Proposing exam schedule in local storage.');
        const exams = getLocalExams();
        const proposals = getLocalProposals();

        const maxExamId = exams.reduce((max, e) => e.id > max ? e.id : max, 0);
        const maxPropId = proposals.reduce((max, p) => p.id > max ? p.id : max, 0);

        const newExam: Examen = {
          id: maxExamId + 1,
          intitule: data.intitule,
          classe_id: data.classe_id,
          matiere_id: data.matiere_id,
          status: 'pending_approval',
          date: null,
          fichier_sujet: null,
          etablissement_id: 1,
          classe: { id: data.classe_id, nom: data.classe_id === 1 ? 'CM1-A' : 'CM2-B', niveau: 'Général', etablissement_id: 1 },
        };

        const newProp: DemandePlannificationExamen = {
          id: maxPropId + 1,
          enseignant_id: 1,
          examen_id: newExam.id,
          date_proposee: data.date_proposee,
          statut: 'pending',
          commentaire_admin: null,
          etablissement_id: 1,
          examen: newExam,
          enseignant: { id: 1, specialite: 'Maths', etablissement_id: 1, user: { id: 99, nom: 'Alaoui', prenom: 'Mohamed', email: 'teacher@test.com', role: 'enseignant' } },
        };

        exams.push(newExam);
        proposals.push(newProp);

        saveLocalExams(exams);
        saveLocalProposals(proposals);

        return { examen: newExam, proposal: newProp };
      }
      throw err;
    }
  },

  async reviewSchedule(id, status, comment) {
    try {
      const response = await axiosClient.post(`/admin/examens/schedule/${id}/review`, {
        statut: status,
        commentaire_admin: comment
      });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Reviewing schedule proposal in local storage.');
        const proposals = getLocalProposals();
        const exams = getLocalExams();

        const pIndex = proposals.findIndex(p => p.id === id);
        if (pIndex !== -1) {
          proposals[pIndex].statut = status;
          proposals[pIndex].commentaire_admin = comment ?? null;

          const examId = proposals[pIndex].examen_id;
          const eIndex = exams.findIndex(e => e.id === examId);
          if (eIndex !== -1) {
            exams[eIndex].status = status === 'approved' ? 'approved' : 'rejected';
            if (status === 'approved') {
              exams[eIndex].date = proposals[pIndex].date_proposee;
            }
          }
          saveLocalProposals(proposals);
          saveLocalExams(exams);
          return proposals[pIndex];
        }
        throw new Error('Proposal not found offline');
      }
      throw err;
    }
  },

  async uploadSujet(id, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post(`/examens/${id}/upload-sujet`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Uploading sujet in local storage.');
        const exams = getLocalExams();
        const eIndex = exams.findIndex(e => e.id === id);
        if (eIndex !== -1) {
          exams[eIndex].fichier_sujet = `subjects/${file.name}`;
          saveLocalExams(exams);
          return exams[eIndex];
        }
        throw new Error('Exam not found offline');
      }
      throw err;
    }
  },

  async getTeacherExams() {
    try {
      const response = await axiosClient.get('/examens/teacher');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalExams();
      }
      throw err;
    }
  },

  async getPendingProposals() {
    try {
      const response = await axiosClient.get('/admin/examens/proposals/pending');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalProposals().filter(p => p.statut === 'pending');
      }
      throw err;
    }
  },

  async getSettings() {
    try {
      const response = await axiosClient.get('/parametres-examens');
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        return getLocalSettings();
      }
      throw err;
    }
  },

  async updateSettings(settings) {
    try {
      const response = await axiosClient.post('/admin/parametres-examens', settings);
      return response.data.data;
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Updating settings in local storage.');
        const local = getLocalSettings();
        const updated = { ...local, ...settings };
        saveLocalSettings(updated);
        return updated;
      }
      throw err;
    }
  }
};
