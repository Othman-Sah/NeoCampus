import { Announcement } from '../entities/Announcement';
import { PaginatedResponse } from './ITransportService';

export interface IAnnouncementService {
  getAnnouncements(params?: Record<string, any>): Promise<PaginatedResponse<Announcement>>;
  getAnnouncement(id: number): Promise<Announcement>;
  createAnnouncement(data: Partial<Announcement>): Promise<Announcement>;
  updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  togglePin(id: number): Promise<Announcement>;
}
