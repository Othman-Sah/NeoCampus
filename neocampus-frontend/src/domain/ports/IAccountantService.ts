import { User } from '../entities/User';

export interface IAccountantService {
  findAll(): Promise<User[]>;
  create(data: any): Promise<User>;
  update(id: number, data: any): Promise<User>;
  delete(id: number): Promise<void>;
}
