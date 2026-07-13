import { axiosClient } from './axiosClient';
import { IParentPortalService } from '../../domain/ports/IParentPortalService';

export const parentPortalApiService: IParentPortalService = {
  async getChildren() {
    const response = await axiosClient.get('/parent/enfants');
    return response.data.data;
  },

  async getChildGrades(childId) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/notes`);
    return response.data.data;
  },

  async getChildAttendance(childId, params) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/presences`, { params });
    return response.data.data;
  },

  async getChildTimetable(childId) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/emploi-du-temps`);
    return response.data.data;
  },

  async getChildBalance(childId) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/solde`);
    return response.data.data;
  },

  async getChildBulletins(childId) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/bulletins`);
    return response.data.data;
  },

  async getChildLoans(childId) {
    const response = await axiosClient.get(`/parent/enfants/${childId}/livres`);
    return response.data.data;
  }
};
