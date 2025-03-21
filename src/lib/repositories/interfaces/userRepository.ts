import { User } from '@/types/database';

export interface UserCreateDto {
  email: string;
  password?: string;
  company_name?: string;
  role?: string;
  auth_provider?: string;
  provider_user_id?: string;
}

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(user: UserCreateDto): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;
} 