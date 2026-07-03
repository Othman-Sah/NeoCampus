import { GroupeFrais } from '../entities/GroupeFrais';

export interface IFinanceGroupeService {
  findById(id: number): Promise<GroupeFrais>;
  findAll(): Promise<GroupeFrais[]>;
  create(groupData: { nom: string; description?: string | null }): Promise<GroupeFrais>;
  update(id: number, groupData: Partial<GroupeFrais>): Promise<GroupeFrais>;
  delete(id: number): Promise<void>;
}
