import { User } from '../entities/User'

export interface Student {
  id: number;
  user_id: number;
  matricule: string;
  classe_id: number;
  dossier_id?: number;
  etablissement_id: number;
  user?: User;
}

export interface IStudentService {
  findById(id: number): Promise<Student>;
  findAllByClasse(classeId: number): Promise<Student[]>;
  create(studentData: Omit<Student, 'id'>): Promise<Student>;
  update(id: number, studentData: Partial<Student>): Promise<Student>;
  delete(id: number): Promise<void>;
  search(filters: Record<string, string>): Promise<Student[]>;
}
