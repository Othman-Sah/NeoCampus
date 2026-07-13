import { ChildSummary } from '../entities/ChildSummary';
import { ChildGrade } from '../entities/ChildGrade';
import { ChildAttendance } from '../entities/ChildAttendance';
import { Seance } from '../entities/Seance';
import { Bulletin } from '../entities/Bulletin';
import { Solde } from '../entities/Solde';
import { Frais } from '../entities/Frais';
import { Paiement } from '../entities/Paiement';

export interface IParentPortalService {
  getChildren(): Promise<ChildSummary[]>;
  getChildGrades(childId: number): Promise<ChildGrade[]>;
  getChildAttendance(childId: number, params?: { start_date?: string; end_date?: string }): Promise<ChildAttendance[]>;
  getChildTimetable(childId: number): Promise<Seance[]>;
  getChildBalance(childId: number): Promise<{ solde: Solde | null; frais: Frais[]; recent_payments: Paiement[] }>;
  getChildBulletins(childId: number): Promise<Bulletin[]>;
  getChildLoans(childId: number): Promise<any[]>;
}
