import { User } from '../entities/User'

export interface LoginResponse {
  token: string;
  user: User;
}

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  me(): Promise<User>;
}
