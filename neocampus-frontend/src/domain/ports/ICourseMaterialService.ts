import { CourseSupport } from '../entities/CourseSupport';
import { Homework } from '../entities/Homework';

export interface ICourseMaterialService {
  listSupports(classeId: number, matiereId?: number): Promise<CourseSupport[]>;
  createSupport(data: {
    classe_id: number;
    matiere_id: number;
    titre: string;
    description?: string;
    fichier_url?: string;
    type: 'document' | 'video' | 'link' | 'image';
  }): Promise<CourseSupport>;
  deleteSupport(id: number): Promise<void>;

  listHomework(classeId: number, matiereId?: number): Promise<Homework[]>;
  createHomework(data: {
    classe_id: number;
    matiere_id: number;
    titre: string;
    description?: string;
    date_echeance: string;
    fichier_url?: string;
  }): Promise<Homework>;
  updateHomework(id: number, data: {
    classe_id?: number;
    matiere_id?: number;
    titre?: string;
    description?: string;
    date_echeance?: string;
    fichier_url?: string;
  }): Promise<Homework>;
  deleteHomework(id: number): Promise<void>;
}
