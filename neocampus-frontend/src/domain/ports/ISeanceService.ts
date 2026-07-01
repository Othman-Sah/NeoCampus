import { Seance } from '../entities/Seance';

export interface ISeanceService {
  findAllByClass(classId: number): Promise<Seance[]>;
  findAllByTeacher(teacherId: number): Promise<Seance[]>;
  create(seanceData: Omit<Seance, 'id' | 'etablissement_id'>): Promise<Seance>;
  update(id: number, seanceData: Partial<Seance>): Promise<Seance>;
  delete(id: number): Promise<void>;
}
