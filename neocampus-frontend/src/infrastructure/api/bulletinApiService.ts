import { axiosClient } from './axiosClient';
import { IBulletinService } from '../../domain/ports/IBulletinService';
import { Bulletin, BulletinConfig, GroupeMatiere, TypeEvaluation, CoefficientClasseMatiere } from '../../domain/entities/Bulletin';

export const bulletinApiService: IBulletinService = {
  async generateBulk(classeId: number, periode: string, anneeScolaire: string): Promise<Bulletin[]> {
    const response = await axiosClient.post('/bulletins/generate/bulk', {
      classe_id: classeId,
      periode,
      annee_scolaire: anneeScolaire
    });
    return response.data.data;
  },

  async generateSingle(eleveId: number, periode: string, anneeScolaire: string): Promise<{ message: string; bulletin_id: string }> {
    const response = await axiosClient.post('/bulletins/generate/single', {
      eleve_id: eleveId,
      periode,
      annee_scolaire: anneeScolaire
    });
    return response.data;
  },

  async updateAppreciations(bulletinId: string, matiereId: number, appreciation: string): Promise<void> {
    await axiosClient.put(`/bulletins/${bulletinId}/appreciations`, {
      matiere_id: matiereId,
      appreciation
    });
  },

  async publish(bulletinId: string): Promise<void> {
    await axiosClient.put(`/bulletins/${bulletinId}/publish`);
  },

  async getBulletin(bulletinId: string): Promise<Bulletin> {
    const response = await axiosClient.get(`/bulletins/${bulletinId}`);
    return response.data.data;
  },

  async getBulletinsByClasse(classeId: number, periode: string, anneeScolaire: string): Promise<Bulletin[]> {
    const response = await axiosClient.get(`/classes/${classeId}/bulletins`, {
      params: {
        periode,
        annee_scolaire: anneeScolaire
      }
    });
    return response.data.data;
  },

  async getMyBulletins(): Promise<Bulletin[]> {
    const response = await axiosClient.get('/my-bulletins');
    return response.data.data;
  },

  // Council decision and locking
  async updateDecision(bulletinId: string, decision: string | null, mention: string | null, appreciationGenerale: string | null): Promise<void> {
    await axiosClient.put(`/bulletins/${bulletinId}/decision`, {
      decision_conseil: decision,
      mention,
      appreciation_generale: appreciationGenerale
    });
  },

  async validate(bulletinId: string): Promise<void> {
    await axiosClient.put(`/bulletins/${bulletinId}/validate`);
  },

  // Bulletin Configurations
  async getSettings(): Promise<BulletinConfig> {
    const response = await axiosClient.get('/bulletin-config');
    return response.data.data;
  },

  async updateSettings(settings: Partial<BulletinConfig>): Promise<BulletinConfig> {
    const response = await axiosClient.put('/bulletin-config', settings);
    return response.data.data;
  },

  // Per-class Coefficients
  async getCoefficients(classeId: number): Promise<CoefficientClasseMatiere[]> {
    const response = await axiosClient.get('/coefficient-classe-matiere', {
      params: { classe_id: classeId }
    });
    return response.data.data;
  },

  async saveCoefficient(classeId: number, matiereId: number, coefficient: number, applyToLevel?: boolean): Promise<CoefficientClasseMatiere> {
    const response = await axiosClient.post('/coefficient-classe-matiere', {
      classe_id: classeId,
      matiere_id: matiereId,
      coefficient,
      apply_to_level: applyToLevel
    });
    return response.data.data;
  },

  async deleteCoefficient(classeId: number, matiereId: number): Promise<void> {
    await axiosClient.delete('/coefficient-classe-matiere', {
      data: { classe_id: classeId, matiere_id: matiereId }
    });
  },

  // Evaluation Types
  async getEvaluationTypes(): Promise<TypeEvaluation[]> {
    const response = await axiosClient.get('/type-evaluations');
    return response.data.data;
  },

  async saveEvaluationType(type: Partial<TypeEvaluation>): Promise<TypeEvaluation> {
    if (type.id) {
      const response = await axiosClient.put(`/type-evaluations/${type.id}`, type);
      return response.data.data;
    } else {
      const response = await axiosClient.post('/type-evaluations', type);
      return response.data.data;
    }
  },

  async deleteEvaluationType(id: number): Promise<void> {
    await axiosClient.delete(`/type-evaluations/${id}`);
  },

  // Subject Groups
  async getSubjectGroups(): Promise<GroupeMatiere[]> {
    const response = await axiosClient.get('/groupe-matieres');
    return response.data.data;
  },

  async saveSubjectGroup(group: Partial<GroupeMatiere>): Promise<GroupeMatiere> {
    if (group.id) {
      const response = await axiosClient.put(`/groupe-matieres/${group.id}`, group);
      return response.data.data;
    } else {
      const response = await axiosClient.post('/groupe-matieres', group);
      return response.data.data;
    }
  },

  async deleteSubjectGroup(id: number): Promise<void> {
    await axiosClient.delete(`/groupe-matieres/${id}`);
  }
};
