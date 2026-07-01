import { Teacher } from '../entities/Teacher';

export interface ITeacherService {
  findById(id: number): Promise<Teacher>;
  findAll(filters?: Record<string, string>): Promise<Teacher[]>;
  create(teacherData: any): Promise<Teacher>;
  update(id: number, teacherData: any): Promise<Teacher>;
  delete(id: number): Promise<void>;
  assign(teacherId: number, classId: number, subjectId: number): Promise<void>;
  unassign(teacherId: number, classId: number, subjectId: number): Promise<void>;
  findAllSubjects(): Promise<any[]>;
  revealPassword(id: number, adminPassword: string): Promise<string>;
  uploadAvatar(id: number, file: File): Promise<string>;
}
