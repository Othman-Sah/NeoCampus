import { TypeFrais } from '../entities/TypeFrais';

export interface IFinanceTypeService {
  findById(id: number): Promise<TypeFrais>;
  findAll(filters?: Record<string, string>): Promise<TypeFrais[]>;
  create(typeData: { libelle: string; groupe_frais_id: number; montant_par_defaut: number }): Promise<TypeFrais>;
  update(id: number, typeData: Partial<TypeFrais>): Promise<TypeFrais>;
  delete(id: number): Promise<void>;
}
