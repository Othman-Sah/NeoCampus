import { Class, ClassMatiereAssignment } from '../entities/Class';
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

  // Class Subjects Management
  getClassMatieres(classeId: number): Promise<ClassMatiereAssignment[]>;
  addMatiereToClass(classeId: number, matiereId: number): Promise<void>;
  removeMatiereFromClass(classeId: number, matiereId: number): Promise<void>;
  assignTeacherToMatiere(classeId: number, matiereId: number, enseignantId: number): Promise<void>;
  setClassMatiereCoefficient(classeId: number, matiereId: number, coefficient: number): Promise<void>;
  getMatieresWithEnseignants(classeId: number): Promise<any[]>;
}
