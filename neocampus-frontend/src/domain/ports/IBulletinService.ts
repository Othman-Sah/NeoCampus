import { Bulletin } from '../entities/Bulletin';

export interface IBulletinService {
  generateBulk(classeId: number, periode: string): Promise<Bulletin[]>;
}
