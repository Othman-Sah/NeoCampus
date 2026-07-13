import { axiosClient } from './axiosClient';
import { INotificationService } from '../../domain/ports/INotificationService';
import { AppNotification } from '../../domain/entities/AppNotification';

export const notificationApiService: INotificationService = {
  async getNotifications(params) {
    const response = await axiosClient.get('/notifications/me', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getUnreadCount() {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  async getLatestUnread(limit = 5) {
    const response = await axiosClient.get('/notifications/latest', { params: { limit } });
    return response.data.data;
  },

  async markAsRead(id) {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await axiosClient.put('/notifications/read-all');
  }
};
