import { Bulletin, BulletinConfig, GroupeMatiere, TypeEvaluation, CoefficientClasseMatiere } from '../entities/Bulletin';

export interface IBulletinService {
  generateBulk(classeId: number, periode: string, anneeScolaire: string): Promise<Bulletin[]>;
  generateSingle(eleveId: number, periode: string, anneeScolaire: string): Promise<{ message: string; bulletin_id: string }>;
  updateAppreciations(bulletinId: string, matiereId: number, appreciation: string): Promise<void>;
  publish(bulletinId: string): Promise<void>;
  getBulletin(bulletinId: string): Promise<Bulletin>;
  getBulletinsByClasse(classeId: number, periode: string, anneeScolaire: string): Promise<Bulletin[]>;
  getMyBulletins(): Promise<Bulletin[]>;

  // Council decision and locking
  updateDecision(bulletinId: string, decision: string | null, mention: string | null, appreciationGenerale: string | null): Promise<void>;
  validate(bulletinId: string): Promise<void>;

  // Bulletin Configurations
  getSettings(): Promise<BulletinConfig>;
  updateSettings(settings: Partial<BulletinConfig>): Promise<BulletinConfig>;

  // Per-class Coefficients
  getCoefficients(classeId: number): Promise<CoefficientClasseMatiere[]>;
  saveCoefficient(classeId: number, matiereId: number, coefficient: number, applyToLevel?: boolean): Promise<CoefficientClasseMatiere>;
  deleteCoefficient(classeId: number, matiereId: number): Promise<void>;

  // Evaluation Types
  getEvaluationTypes(): Promise<TypeEvaluation[]>;
  saveEvaluationType(type: Partial<TypeEvaluation>): Promise<TypeEvaluation>;
  deleteEvaluationType(id: number): Promise<void>;

  // Subject Groups
  getSubjectGroups(): Promise<GroupeMatiere[]>;
  saveSubjectGroup(group: Partial<GroupeMatiere>): Promise<GroupeMatiere>;
  deleteSubjectGroup(id: number): Promise<void>;
}
