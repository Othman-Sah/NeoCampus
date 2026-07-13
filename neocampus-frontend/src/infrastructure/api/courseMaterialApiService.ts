import { axiosClient } from './axiosClient';
import { ICourseMaterialService } from '../../domain/ports/ICourseMaterialService';

export const courseMaterialApiService: ICourseMaterialService = {
  async listSupports(classeId, matiereId) {
    const response = await axiosClient.get('/teacher/supports', {
      params: { classe_id: classeId, matiere_id: matiereId }
    });
    return response.data.data;
  },

  async createSupport(data) {
    const response = await axiosClient.post('/teacher/supports', data);
    return response.data.data;
  },

  async deleteSupport(id) {
    await axiosClient.delete(`/teacher/supports/${id}`);
  },

  async listHomework(classeId, matiereId) {
    const response = await axiosClient.get('/teacher/devoirs', {
      params: { classe_id: classeId, matiere_id: matiereId }
    });
    return response.data.data;
  },

  async createHomework(data) {
    const response = await axiosClient.post('/teacher/devoirs', data);
    return response.data.data;
  },

  async updateHomework(id, data) {
    const response = await axiosClient.put(`/teacher/devoirs/${id}`, data);
    return response.data.data;
  },

  async deleteHomework(id) {
    await axiosClient.delete(`/teacher/devoirs/${id}`);
  }
};
