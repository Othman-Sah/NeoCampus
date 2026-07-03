import { Book } from './Book';
import { Member } from './Member';

export interface Loan {
  id: number;
  book: Book;
  adherent: Member;
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective?: string | null;
  statut: 'en_cours' | 'rendu' | 'en_retard';
  jours_retard?: number;
  amende?: number;
}
