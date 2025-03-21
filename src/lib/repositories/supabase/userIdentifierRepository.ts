import { SupabaseClient } from '@supabase/supabase-js';
import { UserIdentifier } from '@/types/database';
import { IUserIdentifierRepository } from '../interfaces/userIdentifierRepository';

export class SupabaseUserIdentifierRepository implements IUserIdentifierRepository {
  private tableName = 'user_identifiers';

  constructor(private supabaseClient: SupabaseClient) {}

  async getAllByUserId(userId: string): Promise<UserIdentifier[]> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string, userId: string): Promise<UserIdentifier | null> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    
    return data;
  }

  async create(data: Omit<UserIdentifier, 'id' | 'created_at' | 'updated_at'>): Promise<UserIdentifier> {
    const { data: newUserIdentifier, error } = await this.supabaseClient
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    if (!newUserIdentifier) throw new Error('Failed to create user identifier');
    
    return newUserIdentifier;
  }

  async update(
    id: string, 
    userId: string, 
    data: Partial<Omit<UserIdentifier, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserIdentifier | null> {
    // First check if record exists and belongs to user
    const exists = await this.getById(id, userId);
    if (!exists) return null;

    const { data: updatedUserIdentifier, error } = await this.supabaseClient
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return updatedUserIdentifier;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // First check if record exists and belongs to user
    const exists = await this.getById(id, userId);
    if (!exists) return false;

    const { error } = await this.supabaseClient
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
} 