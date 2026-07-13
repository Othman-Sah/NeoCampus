import { AppNotification } from '../entities/AppNotification';
import { PaginatedResponse } from './ITransportService';

export interface INotificationService {
  getNotifications(params?: Record<string, any>): Promise<PaginatedResponse<AppNotification>>;
  getUnreadCount(): Promise<number>;
  getLatestUnread(limit?: number): Promise<AppNotification[]>;
  markAsRead(id: number): Promise<void>;
  markAllAsRead(): Promise<void>;
}
