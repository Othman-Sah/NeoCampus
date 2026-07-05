import { Book } from '../entities/Book';
import { Loan } from '../entities/Loan';
import { Member } from '../entities/Member';

export interface ILibraryService {
  getBooks(params?: { 
    q?: string; 
    genre?: string; 
    disponible?: boolean; 
    per_page?: number; 
    page?: number; 
  }): Promise<{ data: Book[]; meta: any }>;

  createBook(book: Omit<Book, 'id' | 'disponible'>): Promise<Book>;

  updateBook(id: number, book: Partial<Book>): Promise<Book>;

  deleteBook(id: number): Promise<void>;

  getLoans(params?: { 
    statut?: string; 
    q?: string; 
    date_debut?: string; 
    date_fin?: string; 
    per_page?: number; 
    page?: number; 
  }): Promise<{ data: Loan[]; meta: any }>;

  createLoan(livreId: number, adherentId: number): Promise<Loan>;

  returnLoan(id: number): Promise<Loan>;

  getOverdueLoans(params?: { 
    per_page?: number; 
    page?: number; 
  }): Promise<{ data: Loan[]; meta: any }>;

  getStats(): Promise<{ 
    total_books: number; 
    active_loans: number; 
    overdue_loans: number; 
  }>;

  searchMembers(q: string): Promise<Member[]>;

  getSettings(): Promise<{ max_loans_per_member: number; loan_duration_days: number; fine_per_day_mad: number }>;
  updateSettings(settings: { max_loans_per_member: number; loan_duration_days: number; fine_per_day_mad: number }): Promise<void>;
  getMembersList(params?: { q?: string; page?: number; per_page?: number }): Promise<{ data: any[]; meta: any }>;
  getMemberHistory(id: number): Promise<Loan[]>;
  getFines(params?: { status?: string; q?: string; page?: number; per_page?: number }): Promise<{ data: Loan[]; meta: any }>;
  payFine(id: number): Promise<Loan>;
  waiveFine(id: number): Promise<Loan>;
  getAnalytics(): Promise<any>;
}
