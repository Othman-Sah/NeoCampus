import { axiosClient } from './axiosClient';
import { IAnnouncementService } from '../../domain/ports/IAnnouncementService';
import { Announcement } from '../../domain/entities/Announcement';

export const announcementApiService: IAnnouncementService = {
  async getAnnouncements(params) {
    const response = await axiosClient.get('/annonces', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getAnnouncement(id) {
    const response = await axiosClient.get(`/annonces/${id}`);
    return response.data.data;
  },

  async createAnnouncement(data) {
    const response = await axiosClient.post('/annonces', data);
    return response.data.data;
  },

  async updateAnnouncement(id, data) {
    const response = await axiosClient.put(`/annonces/${id}`, data);
    return response.data.data;
  },

  async deleteAnnouncement(id) {
    await axiosClient.delete(`/annonces/${id}`);
  },

  async togglePin(id) {
    const response = await axiosClient.put(`/annonces/${id}/pin`);
    return response.data.data;
  }
};
