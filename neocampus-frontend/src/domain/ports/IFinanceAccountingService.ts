import { RecetteDepense } from '../entities/RecetteDepense';

export interface IFinanceAccountingService {
  findById(id: number): Promise<RecetteDepense>;
  findAll(filters?: Record<string, string>): Promise<RecetteDepense[]>;
  create(entryData: {
    libelle: string;
    montant: number;
    type: 'recette' | 'depense';
    categorie?: string | null;
    date: string;
    justificatif?: string | null;
  }): Promise<RecetteDepense>;
  update(id: number, entryData: Partial<RecetteDepense>): Promise<RecetteDepense>;
  delete(id: number): Promise<void>;
}
