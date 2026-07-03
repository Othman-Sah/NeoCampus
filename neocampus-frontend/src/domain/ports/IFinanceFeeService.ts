import { Frais } from '../entities/Frais';
import { Remise } from '../entities/Remise';
import { Penalite } from '../entities/Penalite';

export interface IFinanceFeeService {
  findById(id: number): Promise<Frais>;
  findAll(filters?: Record<string, string>): Promise<Frais[]>;
  assign(feeData: {
    type_frais_ids: number[];
    eleve_id?: number | null;
    classe_id?: number | null;
    date_echeance: string;
    annee_scolaire?: string | null;
    custom_amount?: number;
  }): Promise<Frais[]>;
  applyRemise(feeId: number, remiseData: { pourcentage: number; motif?: string | null }): Promise<Remise>;
  applyPenalite(feeId: number, penaliteData: { montant: number; motif?: string | null }): Promise<Penalite>;
}
