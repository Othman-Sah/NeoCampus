import { User } from '../entities/User'

export interface ParentContact {
  nom?: string;
  relation?: string;
  telephone?: string;
  email?: string;
}

export interface Student {
  id: number;
  etablissement_id: number;
  user_id?: number | null;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string | null;
  sexe?: 'Male' | 'Female' | 'Other' | null;
  date_naissance?: string | null;
  classe_id?: number | null;
  classe_nom?: string | null;
  status: 'Active' | 'Suspended';
  parent_contact?: ParentContact | null;
  documents?: Record<string, boolean | string> | null;
  scolarite_anterieure?: string | null;
  avatar?: string | null;
  user?: User;
}

export interface IStudentService {
  findById(id: number): Promise<Student>;
  findAllByClasse(classeId: number): Promise<Student[]>;
  create(studentData: Omit<Student, 'id' | 'etablissement_id'>): Promise<Student>;
  update(id: number, studentData: Partial<Student>): Promise<Student>;
  delete(id: number): Promise<void>;
  search(filters: Record<string, string>): Promise<Student[]>;
  uploadAvatar(id: number, file: File): Promise<string>;
  revealPassword(id: number, adminPassword: string): Promise<string>;
  updatePassword(id: number, adminPassword: string, newPassword: string): Promise<void>;
}
