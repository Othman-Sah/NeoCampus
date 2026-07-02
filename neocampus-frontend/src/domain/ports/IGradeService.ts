import { Note } from '../entities/Note';
import { DemandeExceptionNote } from '../entities/DemandeExceptionNote';

export interface IGradeService {
  submitBulk(examenId: number, grades: { eleve_id: number; valeur: number }[]): Promise<any>;
  requestException(examenId: number, motif: string): Promise<any>;
  approveException(id: number): Promise<any>;
  checkWindow(examenId: number): Promise<{ within_window: boolean; exception_granted: boolean; can_enter_grades: boolean }>;
  getPendingExceptions(): Promise<DemandeExceptionNote[]>;
  findByExamen(examenId: number): Promise<Note[]>;
}
