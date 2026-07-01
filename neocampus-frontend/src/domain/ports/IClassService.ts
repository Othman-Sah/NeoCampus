import { Class } from '../entities/Class';
import { Section } from '../entities/Section';

export interface IClassService {
  findById(id: number): Promise<Class>;
  findAll(filters?: Record<string, string>): Promise<Class[]>;
  create(classData: Omit<Class, 'id' | 'etablissement_id'>): Promise<Class>;
  update(id: number, classData: Partial<Class>): Promise<Class>;
  delete(id: number): Promise<void>;

  // Sections
  findAllSections(): Promise<Section[]>;
  createSection(sectionData: { nom: string }): Promise<Section>;
  deleteSection(id: number): Promise<void>;

  // Academic years
  findAllAcademicYears(): Promise<any[]>;
}
