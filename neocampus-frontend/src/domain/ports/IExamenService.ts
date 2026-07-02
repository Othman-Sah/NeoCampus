import { Examen } from '../entities/Examen';
import { ParametresExamen } from '../entities/ParametresExamen';
import { DemandePlannificationExamen } from '../entities/DemandePlannificationExamen';

export interface IExamenService {
  proposeSchedule(data: {
    intitule: string;
    classe_id: number;
    matiere_id: number;
    date_proposee: string;
  }): Promise<any>;
  reviewSchedule(id: number, status: 'approved' | 'rejected', comment?: string): Promise<any>;
  uploadSujet(id: number, file: File): Promise<any>;
  getTeacherExams(): Promise<Examen[]>;
  getPendingProposals(): Promise<DemandePlannificationExamen[]>;
  getSettings(): Promise<ParametresExamen | null>;
  updateSettings(settings: Omit<ParametresExamen, 'id' | 'etablissement_id'>): Promise<ParametresExamen>;
}
