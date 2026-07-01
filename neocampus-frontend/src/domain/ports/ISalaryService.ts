import { Salary } from '../entities/Salary';

export interface ISalaryService {
  findById(id: number): Promise<Salary>;
  findAll(filters?: Record<string, string>): Promise<Salary[]>;
  create(salaryData: any): Promise<Salary>;
  update(id: number, salaryData: Partial<Salary>): Promise<Salary>;
  delete(id: number): Promise<void>;
  findMySalaries(): Promise<Salary[]>;
}
