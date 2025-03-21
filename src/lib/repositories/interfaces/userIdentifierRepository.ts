import { UserIdentifier } from '@/types/database';

export interface IUserIdentifierRepository {
  getAllByUserId(userId: string): Promise<UserIdentifier[]>;
  getById(id: string, userId: string): Promise<UserIdentifier | null>;
  create(data: Omit<UserIdentifier, 'id' | 'created_at' | 'updated_at'>): Promise<UserIdentifier>;
  update(id: string, userId: string, data: Partial<Omit<UserIdentifier, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserIdentifier | null>;
  delete(id: string, userId: string): Promise<boolean>;
} 