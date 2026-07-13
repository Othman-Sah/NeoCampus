import { User } from '../entities/User';

export interface ParentUser extends User {
  children?: any[];
}

export interface IParentService {
  findAll(): Promise<ParentUser[]>;
  create(data: any): Promise<ParentUser>;
  update(id: number, data: any): Promise<ParentUser>;
  delete(id: number): Promise<void>;
}
