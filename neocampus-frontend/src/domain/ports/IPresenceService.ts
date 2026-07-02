import { Presence } from '../entities/Presence';

export interface IPresenceService {
  submitBulk(
    seanceId: number,
    date: string,
    presences: { eleve_id: number; statut: string; motif?: string | null }[]
  ): Promise<any>;
  getClassPresences(classeId: number, date: string): Promise<Presence[]>;
  getStudentPresences(eleveId: number): Promise<Presence[]>;
  getAllPresences(filters: { range?: string; search?: string }): Promise<Presence[]>;
  updatePresenceStatus(id: number, statut: string, motif?: string | null): Promise<any>;
}
